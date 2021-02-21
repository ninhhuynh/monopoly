<template>
  <div v-if="GameStart(gameStart)" class="bg">
    <Board
      @buyhouse="BuyHouse"
      @degrade="Degrade"
      @ask-buy="AskBuy"
      @roll-dice="RollDice"
      @end-turn="EndTurn"
      @buy-prop="BuyProperty"
      @view-build="ViewBuildable"
      :game="game"
      :ownedProperty="ownedPropertyList"
      :buildViewer="buildViewer"
      :viewCard="viewCard"
      :user="user"
      :isRollDice="isRollDice"
      :isEndTurn="isEndTurn"
      :isBuyProperty="isBuyProperty"
      :isBuyHouse="isBuyHouse"
      :dice="dice"
      @click-board-chance="DisableChanceCard"
    />
  </div>
</template>
<script>
import Board from "./Board.vue";
import Helper from "../helper/helper.js";
export default {
  components: {
    Board,
  },
  props: {
    user: {
      name: String,
      index: Number,
    },
    msg: String,
    gameStart: Boolean,
  },
  computed: {
    isUserTurn() {
      return this.user.index == this.game.turn;
    },
    isRollDice() {
      return this.isUserTurn && this.game.action.canRoll;
    },
    isEndTurn() {
      return this.isUserTurn && this.game.action.endTurn;
    },
    isBuyProperty() {
      return this.isUserTurn && this.game.action.buyProperty;
    },
    isBuyHouse() {
      return this.isUserTurn && this.game.action.buyHouse && !this.buildViewer;
    },
  },
  data() {
    return {
      ownedPropertyList: [],
      imgNum: 1,
      game: {},
      dice: "0, 0",
      started: false,
      propertiesState: 0,
      buildViewer: false,
      viewCard: {},
    };
  },
  methods: {
    AskBuy(data) {
      this.axios
        .post("http://localhost:3000/", data)
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    Cheat(funcname, param) {
      this.axios
        .post("http://localhost:3000/", {
          id: "cheat",
          from: this.user.index,
          data: {
            func: funcname,
            param: param,
          },
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    EndTurn() {
      this.game.action.endTurn = false;
      this.game.action.buyProperty = false;
      this.game.action.buyHouse = false;
      this.viewCard = { view: false };
      this.axios
        .post("http://localhost:3000/", { id: "et", from: this.user.index })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    ViewBuildable() {
      this.buildViewer = true;
    },
    DisableChanceCard() {
      if (this.viewCard.isGoto) {
        this.AskForNewPosAction();
      }
      this.viewCard = {};
    },
    Degrade(prop) {
      if (this.dgTimeOut) {
        return;
      }
      this.dgTimeOut = true;
      this.axios
        .post("http://localhost:3000/", {
          id: "mt",
          from: this.user.index,
          propIndex: prop.index,
        })
        .then((res) => {
          this.dgTimeOut = false;
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    BuyHouse(prop) {
      console.log(prop);
      this.game.action.buyProperty = false;
      this.buildViewer = false;
      this.axios
        .post("http://localhost:3000/", {
          id: "bh",
          from: this.user.index,
          propIndex: prop.index,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    BuyProperty() {
      this.game.action.buyProperty = false;
      this.game.action.endTurn = false;
      this.viewCard = { view: false };
      this.axios
        .post("http://localhost:3000/", {
          id: "bp",
          from: this.user.index,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    },
    SetIconPos(pos) {
      return Helper.SetIconPos(pos);
    },
    GameStart(gameStart) {
      if (gameStart && !this.started) {
        setInterval(() => {
          this.axios
            .get("http://localhost:3000/")
            .then((res) => {
              this.game = res.data;
              if (this.game.propertiesState != this.propertiesState) {
                this.ownedPropertyList = Helper.OwnedPropertyList(
                  this.game.players
                );
              }
              if (
                !this.game.askTrade.canAsk &&
                this.game.askTrade.property.state.owner == this.user.index &&
                !this.handlingTrade
              ) {
                this.handlingTrade = true;
                let data = this.game.askTrade;
                let result = confirm(
                  `${this.game.players[data.askerIndex].name} wants to trade ${
                    data.property.index
                  } for ${data.payment}`
                );
                this.axios
                  .post("http://localhost:3000/", {
                    id: "treply",
                    from: this.user.index,
                    answer: result,
                  })
                  .then((res) => {
                    this.handlingTrade = false;
                    console.log(res.data);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }, 500);
        this.started = true;
      }
      return gameStart;
    },
    RollDice() {
      this.game.action.canRoll = false;
      let rollResult = [Helper.RollDice(), Helper.RollDice()];
      let isEqual = rollResult[0] == rollResult[1];
      console.log(isEqual);
      let result = {
        id: "rd",
        from: this.user.index,
        data: {
          result: rollResult[0] + rollResult[1],
          isEqual: isEqual,
        },
      };
      this.dice = `${rollResult[0]}, ${rollResult[1]}`;
      this.axios
        .post("http://localhost:3000/", result)
        .then((res) => {
          //the server reply what you should do here
          console.log(res.data);
          if (res.data.type) {
            setTimeout(() => {
              this.ViewChestChance(res.data);
            }, 1000);
            return;
          }
          if (res.data.prop) {
            setTimeout(() => {
              this.ViewPropertyCard(res.data.prop);
            }, 1000);
            return;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    AskForNewPosAction() {
      if (!this.canAskNewPosAction) return;
      this.canAskNewPosAction = false;
      this.axios
        .post("http://localhost:3000/", {
          id: "rd",
          from: this.user.index,
        })
        .then((res) => {
          if (res.data.type) {
            setTimeout(() => {
              this.ViewChestChance(res.data);
            }, 1000);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    ViewChestChance(prop) {
      this.viewCard = {};
      this.viewCard.view = true;
      this.viewCard.type = prop.type;
      this.viewCard.img = prop.type + ".png";
      this.viewCard.text = [];
      this.viewCard.text.push(prop.desc);
      this.viewCard.isGoto = prop.isGoto;
    },
    ViewPropertyCard(prop) {
      this.viewCard = {};
      this.viewCard.view = true;
      this.viewCard.type = prop.type;
      if (prop.type == "trans") {
        this.viewCard.img = prop.type + ".png";
        this.viewCard.text = [];
        this.viewCard.text.push(prop.index);
        for (let i = 1; i < 5; i++) {
          this.viewCard.text.push(prop.rent * i + "$");
        }
        this.viewCard.text.push(prop.mortage + "$");
        return;
      }
      if (prop.type == "util") {
        this.viewCard.img = prop.index < 15 ? "electric.png" : "water.png";
        this.viewCard.text = [];
        this.viewCard.text.push(prop.mortage + "$");
        return;
      }
      this.viewCard.img = prop.type + ".jpg";
      this.viewCard.text = [];
      this.viewCard.text.push(prop.index);
      this.viewCard.text.push(prop.rent + "$");
      this.viewCard.text.push(prop.rent1 + "$");
      this.viewCard.text.push(prop.rent2 + "$");
      this.viewCard.text.push(prop.rent3 + "$");
      this.viewCard.text.push(prop.rent4 + "$");
      this.viewCard.text.push(prop.rent5 + "$");
      this.viewCard.text.push(prop.mortage + "$");
      this.viewCard.text.push(prop.housePrice + "$");
      this.viewCard.text.push(prop.housePrice + "$");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
