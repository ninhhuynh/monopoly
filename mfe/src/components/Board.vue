<template>
  <div class="container">
    <div class="userInput">
      <button :disabled="!isRollDice" @click="$emit('roll-dice')">
        Roll!
      </button>
      <br />
      <button :disabled="!isEndTurn" @click="$emit('end-turn')">
        End Turn
      </button>
      <br />
      <button :disabled="!isBuyProperty" @click="$emit('buy-prop')">
        Buy Property
      </button>
      <br />
      <button :disabled="!isBuyHouse" @click="$emit('view-build')">
        Buy House
      </button>
      <br />
      <strong>{{ dice }}</strong>
    </div>
    <img :src="require('../assets/game-background.png')" class="board" />
    <div v-if="viewCard.view" class="cardcontainer" @click="ClickBoardChance">
      <img :src="require(`../assets/${viewCard.img}`)" class="ccard" />
      <strong
        v-for="(text, i) in viewCard.text"
        :key="'text' + i"
        :style="TextPosition(viewCard.type, i)"
        >{{ viewCard.text[i] }}
      </strong>
    </div>
    <img
      v-for="(player, i) in game.players"
      :src="require(`../assets/icons/${player.img}`)"
      :style="GetIconStyle(player.position, game.players.indexOf(player))"
      :key="'player' + i"
    />
    <div
      v-for="(p, i) in ownedProperty"
      :key="'Property' + i"
      :style="OwnedPropertyStyle(p.index)"
    >
      <img
        @click="AskBuy(p)"
        class="ownerImg"
        :src="require(`../assets/icons/${game.players[p.state.owner].img}`)"
      />
      <div id="block" :style="HouseNumStyle(p.index)">
        <strong @click="BuyHouse(p)" v-if="isBuildState(p.index)">=^=</strong>
        <button @click="Degrade(p)" v-if="canDegrade(p)">Mort</button>
        <strong
          v-if="
            p.houseNum != null && p.state.rent != -1 && !isBuildState(p.index)
          "
          >{{ p.houseNum }}</strong
        >
        <strong v-else>M</strong>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "../helper/helper.js";
export default {
  props: {
    isRollDice: Boolean,
    isEndTurn: Boolean,
    isBuyProperty: Boolean,
    isBuyHouse: Boolean,
    dice: String,
    user: {
      name: String,
      index: Number,
    },
    ownedProperty: Array,
    game: {
      players: [],
    },
    buildViewer: Boolean,
    viewCard: { view: false },
  },
  computed: {},
  methods: {
    AskBuy(property) {
      if (this.game.turn != this.user.index) return;
      if (!this.game.askTrade.canAsk) return;

      let res = prompt("How much will you give the owner for this?", "0");
      if (isNaN(res)) {
        alert("this is not a number!");
        return;
      }
      if (res < 1) {
        alert("please try again, use a positive number");
        return;
      }
      if (res > this.game.players[this.user.index].money) {
        alert("you dont have such money");
        return;
      }
      this.$emit("ask-buy", {
        id: "trade",
        from: this.user.index,
        propIndex: property.index,
        payment: res,
      });
    },
    ClickBoardChance() {
      if (
        this.viewCard.view &&
        (this.viewCard.type == "chance" || this.viewCard.type == "chest")
      ) {
        this.$emit("click-board-chance");
      }
    },
    BuyHouse(propIndex) {
      this.$emit("buyhouse", propIndex);
    },
    isBuildState(propIndex) {
      return (
        this.buildViewer && this.game.action.listProperty.includes(propIndex)
      );
    },
    canDegrade(p) {
      return (
        this.user.index == p.state.owner && this.user.index == this.game.turn
      );
    },
    Degrade(p) {
      this.$emit("degrade", p);
    },
    Exist(prop) {
      return prop !== "undefined" ? true : false;
    },
    GetIconStyle(pos, index) {
      return Helper.GetIconStyle(pos, index);
    },
    OwnedPropertyStyle(pos) {
      return Helper.OwnedPropertyStyle(pos);
    },
    HouseNumStyle(pos) {
      return Helper.HouseNumStyle(pos);
    },
    TextPosition(type, i) {
      return Helper.CardTextPos(type, i);
    },
  },
  data() {
    return {};
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#block button {
  font-size: 10px;
  padding: 1px 1px;
}
#block strong {
  position: absolute;
  top: -70%;
  left: 30%;
}
.userInput {
  position: absolute;
  left: 100%;
  top: 66%;
}
.ownerImg {
  position: absolute;
  left: 0px;
  top: 0px;
  max-height: 100%;
  max-width: 100%;
}
.container {
  position: fixed;
  left: 0px;
  top: 0px;
  max-height: 100vh;
}
.cdesc {
  position: absolute;
}
.cardcontainer {
  position: absolute;
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ccard {
  max-height: 50%;
  max-width: 50%;
}
.board {
  max-width: 100%;
  max-height: 100vh;
}
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
