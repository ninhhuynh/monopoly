<template id="main">
  <div id="app">
    <div class="center" v-show="!boardShow">
      <button @click="ChangeIconL()">&lt;</button>
      <img class="icon" :src="require(`./assets/icons/${img}`)" />
      <button @click="ChangeIconR()">&gt;</button>
      <br /><br /><br />
      <input class="inputborder" type="text" v-model="user.name" />
      <br /><br />
      <button @click="StartGame()">Start!</button>
      <br /><br />
      <strong v-if="errors.changeName">
        too short or contain special character should be [0-9a-zA-Z_.-]
      </strong>
      <br /><br />
      <strong v-if="errors.nameExist">
        Name or Icon already exist
      </strong>
      <strong v-if="errors.connErr > 0">
        Connection to Server failed: {{ errors.connErr }} times
      </strong>
    </div>
    <Game :gameStart="boardShow" :user="user" />
  </div>
</template>

<script>
import Game from "./components/Game.vue";
import Helper from "./helper/helper.js";
export default {
  name: "App",
  components: {
    Game,
  },
  methods: {
    StartGame() {
      if (!Helper.IsValidName(this.user.name) || this.user.name.length < 2) {
        this.errors.changeName = true;
        return;
      }
      console.log("start game");
      this.axios
        .post("http://localhost:3000/", {
          id: "reg",
          data: this.user,
        })
        .then((res) => {
          this.user = res.data;
          if (this.user.index >= 0) {
            this.boardShow = true;
          } else {
            this.errors.nameExist = true;
          }
          console.log("register success");
        })
        .catch(() => {
          this.errors.connErr++;
        });
    },
    ChangeIconL() {
      this.imgNum = this.imgNum == 1 ? 7 : this.imgNum - 1;
      this.user.img = this.img;
    },
    ChangeIconR() {
      this.imgNum = this.imgNum == 7 ? 1 : this.imgNum + 1;
      this.user.img = this.img;
    },
  },
  computed: {
    img() {
      return `${this.imgNum}.png`;
    },
  },
  data() {
    return {
      imgNum: 1,
      user: {
        name: "Ninh",
        index: -1,
        img: `1.png`,
      },
      boardShow: false,
      errors: {
        nameExist: false,
        changeName: false,
        connErr: 0,
      },
    };
  },
};
</script>
<style scoped>
.icon {
  max-width: 15%;
  max-height: 15%;
  position: relative;
  top: 25px;
}
</style>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.inputborder {
  border: 2px solid;
}
.center {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
