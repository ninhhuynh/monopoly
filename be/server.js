const express = require("express");
// const bodyParser = require('body-parser');
const csv = require("csv-parser");
const fs = require("fs");
const { send, prependOnceListener } = require("process");
const app = express();
const port = 3000;
// const cors = require('cors')
let game = {
  types: ["go", "chest", "tax", "chance", "jail", "park", "police", "acc"],
  players: [],
  blocks: [],
  log: [],
  turn: 0,
  propertiesState: 0,
  latestDiceRes: -1,
  oneMore: 0,
  askTrade: {
    canAsk: true,
  },
  get curPlayer() {
    return this.players[this.turn];
  },
  get curBlock() {
    return this.blocks[this.curPlayer.position];
  },
  action: {
    endturn: false,
    buyProperty: false,
    get buyHouse() {
      return this.CheckBuyHouse(game.action.endturn);
    },
    get endTurn() {
      return this.endturn;
    },
    set endTurn(bool) {
      this.buyHouse = this.CheckBuyHouse(bool);
      this.endturn = bool;
    },

    listBuildableProperty: [],

    CheckBuyHouse: function (bool) {
      if (bool === false) {
        return bool;
      }
      this.listBuildableProperty = [];
      let whatIHave = game.curPlayer.owns;
      for (const street in whatIHave) {
        if (
          whatIHave[street] &&
          whatIHave[street].length == streetTotalProperty[street]
        ) {
          let min = Math.min(
            ...whatIHave[street].map((property) => property.houseNum)
          );
          if (min < 5) {
            let newArr = whatIHave[street]
              .filter((property) => {
                return property.houseNum == min;
              })
              .map((prop) => prop.index);
            this.listBuildableProperty.push(...newArr);
          }
        }
      }
      return this.listBuildableProperty.length > 0;
    },
    abc: function () {},
  },
  canRoll: true,
  KillPlayer: function (pIndex) {
    let owns = this.players[pIndex].owns;
    for (const streets in owns) {
      owns[streets].forEach((property) => {
        property.Renew();
      });
    }
    owns = {};
  },
  NextTurn: function () {
    if (this.curPlayer.money < 0) {
      this.KillPlayer(this.curPlayer.index);
    }
    if (this.oneMore > 0) {
      return;
    }
    this.turn++;
    if (this.turn >= this.players.length) {
      this.turn = 0;
    }
    if (this.curPlayer.isAlive == false) {
      this.NextTurn();
    }
  },
  GiveProperty: function (pIndex, bIndex) {
    let player = this.players[pIndex];
    let property = this.blocks[bIndex];
    if (!player.owns[`${property.type}`]) {
      player.owns[`${property.type}`] = [];
    }
    player.owns[`${property.type}`].push(property);
    property.state = {
      owner: player.index,
      rent: Number(property.rent),
    };
    if (property.type == "trans") {
      let i = 0;
      while (player.owns.trans.length > i) {
        player.owns.trans[i++].state.rent =
          property.rent * player.owns.trans.length;
      }
    }
    this.propertiesState++;
  },
  CurrentPlayerBuyProperty: function () {
    let curPlayer = this.players[this.turn];
    let property = this.blocks[curPlayer.position];
    this.TransferMoney(curPlayer.index, -1, property.price);
    this.GiveProperty(this.turn, curPlayer.position);
  },
  GetCurBlock: function () {
    return this.blocks[this.players[this.turn].position];
  },
  GetBlocksInfo: function (str) {
    fs.createReadStream(str)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => {
        property = new Property(data);
        property.index = this.blocks.push(property) - 1;
      })
      .on("end", () => {
        console.log(`registered ${this.blocks.length} blocks`);
      });
  },
  GeneratePlayer: function (data) {
    let result;
    this.players.every((item, index) => {
      // the case where the user is the old user
      let samename = item.name == data.name;
      let sameimg = item.img == data.img;
      if (samename && sameimg) {
        result = index;
        return false;
      }
      // the case where the user is a new user but want the same name
      if (samename || sameimg) {
        result = -1;
        return false;
      }
      return true;
    });
    if (result !== undefined) {
      return result;
    }
    let index = this.players.push(new Player(data.name, data.img)) - 1;
    this.players[index].index = index;
    return index;
  },
  MovePlayer: function (index, distance) {
    let player = this.players[index];
    player.position += distance;
    if (player.position > 39) {
      player.position -= 39;
      player.money += 200;
    }
    return player.position;
  },
  RegisterDiceResult: function (rollInfo = new RollInfo()) {
    if (this.turn != rollInfo.from) {
      return;
    }
    if (rollInfo.isEqual) {
      this.oneMore++;
      if (this.oneMore == 3) {
        this.GoToJail(this.turn);
        this.oneMore = 0;
        return;
      }
    } else this.oneMore = 0;
    if (this.curPlayer.idle > 0) {
      if (rollInfo.isEqual) {
        this.curPlayer.idle = 0;
        this.oneMore = 0;
      } else {
        this.curPlayer.idle--;
        return 0;
      }
    }
    this.latestDiceRes = rollInfo.result;
    let newpos = this.MovePlayer(rollInfo.from, rollInfo.result);
    console.log(
      `the player at index: ${rollInfo.from} rolled: ${rollInfo.result} get new pos: ${newpos}`
    );
    return 1;
  },
  TransferMoney(gIndex, rIndex, n) {
    n = Number(n);
    if (gIndex == -1) {
      this.players[rIndex].money += n;
      return;
    }
    if (rIndex == -1) {
      this.players[gIndex].money -= n;
      return;
    }
    this.players[gIndex].money -= n;
    this.players[rIndex].money += n;
    return;
  },
  GetRent: function () {
    if ((this.curBlock.type = "util")) {
      let ownerHas = this.players[this.curBlock.owner].owns.util.length;
      return ownerHas == 1 ? this.latestDiceRes * 4 : this.latestDiceRes * 10;
    }
    if (this.curBlock.state.rent == -1) {
      return 0;
    }
    return this.curBlock.state.rent;
  },
  SetReplyObject: function () {
    let result = this.GetActionCode();
    switch (result) {
      case -1: //bankruptcy
        this.TransferMoney(
          this.turn,
          this.GetCurBlock().state.owner,
          this.GetRent()
        );
        return "bankrupt";
      case 0:
        this.action.endTurn = true;
        return "et";
      case 1:
        this.action.endTurn = true;
        this.action.buyProperty = true;
        return { prop: game.curBlock };
      case 3:
        this.TransferMoney(
          this.turn,
          this.GetCurBlock().state.owner,
          this.GetRent()
        );
        this.action.endTurn = true;
        return "et";
      default:
        if (!result.isGoto) {
          this.action.endTurn = true;
        }
        return result;
    }
  },
  GetActionCode: function () {
    //block properties:
    //type;price;housePrice;rent;rent1;rent2;rent3;rent4;rent5;mortage;state(doesnt exist by default)
    if (this.types.includes(this.curBlock.type)) {
      return this.ActionToOtherBlock();
    }
    return this.ActionToPropertyBlock();
  },
  ActionToPropertyBlock() {
    let curBlock = this.GetCurBlock();
    if (curBlock.state?.owner == null) {
      return 1; // ask player to buy property
    }
    if (
      this.players[this.turn].money < curBlock.price ||
      curBlock.state.owner == this.turn
    ) {
      return 0; // do nothing
    }
    if (this.players[this.turn].money < this.GetRent()) {
      return -1; // decide if player should be bankrupt or not
    }
    return 3;
    // block has owner and player has more money than rent
  },

  ActionToOtherBlock: function () {
    //["go", "chest", "tax", "chance", "jail", "park", "police", "acc"]
    switch (this.curBlock.type) {
      case "go":
        break;
      case "jail":
        break;
      case "park":
        break;
      case "tax":
        this.TransferMoney(this.turn, -1, 200);
        break;
      case "acc":
        this.TransferMoney(this.turn, -1, 100);
        break;
      case "police":
        this.GoToJail(this.turn);
        break;
      case "chance":
        return this.Chance();
      case "chest":
        return this.Chest();
      default:
        break;
    }
    return 0; //currently do nothing
  },
  GetHouseNumOfPlayer: function (pIndex) {
    let owns = this.players[pIndex].owns;
    let result = 0;
    for (const streets in owns) {
      owns[streets].forEach((property) => {
        result += Number(property.houseNum);
      });
    }
    return result;
  },
  Chance: function () {
    let rand = Math.floor(Math.random() * this.chances.length);
    let chance = this.chances[rand];
    return {
      type: "chance",
      desc: this.HandleChance(chance),
      isGoto: this.CheckGotoChance(chance),
    };
  },
  CheckGotoChance: function (chance) {
    return chance.type == "goto";
  },
  Chest: function () {
    let rand = Math.floor(Math.random() * this.chests.length);
    let chest = this.chests[rand];
    return {
      type: "chest",
      desc: this.HandleChance(chest),
      isGoto: this.CheckGotoChance(chest),
    };
  },
  HandleChance: function (chest) {
    switch (chest.type) {
      case "tojail":
        this.GoToJail(this.turn);
        break;
      case "nojail":
        this.curPlayer.idle = -1;
        break;
      case "getmoney":
        this.TransferMoney(-1, this.turn, chest.amount);
        break;
      case "lostmoney":
        this.TransferMoney(this.turn, -1, chest.amount);
        break;
      case "giveall":
        this.players.forEach((player) => {
          if (player.index == this.turn) return;
          this.TransferMoney(this.turn, player.index, chest.amount);
        });
        break;
      case "collect":
        this.players.forEach((player) => {
          if (player.index == this.turn) return;
          this.TransferMoney(player.index, this.turn, chest.amount);
        });
        break;
      case "repair":
        this.TransferMoney(
          this.turn,
          -1,
          chest.amount * this.GetHouseNumOfPlayer(this.turn)
        );
        break;
      case "goto":
        if (chest.amount) {
          this.MovePlayer(this.turn, chest.amount);
        } else {
          this.MovePlayer(this.turn, () => {
            if (chest.dest == -1) {
              return Math.floor(Math.random() * this.blocks.length - 1) + 1;
            }
            if (chest.dest >= this.curPlayer.position) {
              return chest.dest - this.curPlayer.position;
            }
            this.MovePlayer(
              this.turn,
              this.blocks.length - 1 - this.curPlayer.position
            );
            return chest.dest;
          });
        }
        break;
      default:
        break;
    }
    return chest.desc;
  },
  GoToJail(pIndex) {
    if (this.players[pIndex].idle == -1) {
      this.players[pIndex].idle = 0;
      this.Logs("used get out of jail");
      return;
    }
    this.players[pIndex].position = 10;
    this.players[pIndex].idle = 3;
  },
  BuyHouse: function (pIndex, bIndex) {
    let property = this.blocks[bIndex];
    if (this.players[pIndex].money < property.housePrice) {
      return "no money";
    }
    this.players[pIndex].money -= Number(property.housePrice);
    property.state.rent = Number(property[`rent${++property.houseNum}`]);
  },
  Logs: function (str = "") {
    this.log.push(`${this.players[pIndex].name} ${str}`);
  },
  logLength: 0,
  isNewAction: function () {
    return this.log.length - this.logLength;
  },
  GetChanceAndChestInfo: function (chancePath, chestPath) {
    this.chances = [];
    this.chests = [];
    fs.createReadStream(chancePath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => {
        this.chances.push(data);
      })
      .on("end", () => {
        console.log(`registered ${this.chances.length} chances`);
      });
    fs.createReadStream(chestPath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => {
        this.chests.push(data);
      })
      .on("end", () => {
        console.log(`registered ${this.chests.length} chests blocks`);
      });
  },
  Degrade: function (bIndex, pIndex) {
    if (pIndex != this.turn) {
      return "not your turn";
    }
    let property = this.blocks[bIndex];
    switch (property.Degrade()) {
      case -1:
        this.TransferMoney(pIndex, -1, property.mortage * (1 + 0.1));
        return "you have lift the mortage";
      case -2:
        return "no one owns this property";
      case 0:
        this.TransferMoney(-1, pIndex, property.mortage);
        return "you have mortaged the property and recieve some money";
      case 1:
        this.TransferMoney(-1, pIndex, property.housePrice / 2);
        return "you have sold a house";
    }
  },
  AskTrade: function (pIndex, propIndex, payment) {
    this.askTrade.canAsk = false;
    this.askTrade.askerIndex = pIndex;
    this.askTrade.property = this.blocks[propIndex];
    this.askTrade.payment = payment;
    return "asked";
  },
  replyTrade: function (answer) {
    if (answer) {
      let property = this.askTrade.property;
      let ownerindex = property.state.owner;
      let mortaged = property.state.rent == -1;
      this.players[ownerindex].RemoveProperty(property);
      this.GiveProperty(this.askTrade.askerIndex, property.index);
      if (mortaged) {
        property.state.rent = -1;
      }
      this.TransferMoney(
        this.askTrade.askerIndex,
        ownerindex,
        this.askTrade.payment
      );
    }
    this.askTrade = { canAsk: true };
    return "replied";
  },
};
game.GetBlocksInfo("blockinfo.csv");
game.GetChanceAndChestInfo("chance.csv", "chest.csv");
// app.use(cors())
app.use(express.json());
app.use(function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send({
    turn: game.turn,
    players: game.players,
    action: {
      canRoll: game.canRoll,
      endTurn: game.action.endTurn,
      buyHouse: game.action.buyHouse,
      buyProperty: game.action.buyProperty,
      listProperty: game.action.listBuildableProperty,
    },
    propertiesstate: game.propertiesState,
    askTrade: game.askTrade,
  });
});

app.post("/", (req, res) => {
  console.log("recieve post request", req.body);
  switch (req.body.id) {
    case "treply":
      if (
        req.body.from != game.askTrade.property?.state.owner ||
        game.askTrade.canAsk == true //cannnot ask mean can reply
      ) {
        break;
      }

      res.send(game.replyTrade(req.body.answer));
      break;
    case "trade":
      if (req.body.from != game.turn) break;
      res.send(
        game.AskTrade(req.body.from, req.body.propIndex, req.body.payment)
      );
      break;
    case "cheat":
      let data = req.body.data;
      if (!game[data.func]) {
        res.send("function doesnt exist");
        break;
      }
      game[data.func](...data.param);
      res.send(`called ${data.func}`);
      break;
    case "reg":
      let user = req.body.data;
      user.index = game.GeneratePlayer(user);
      res.send(user);
      break;
    case "rd":
      if (req.body.from != game.turn) break;
      if (game.canRoll == false) {
        console.log("create action for the current block");
        res.send(game.SetReplyObject());
        break;
      }
      game.canRoll = false;
      let rollInfo = new RollInfo({
        from: req.body.from,
        result: req.body.data.result,
        isEqual: req.body.data.isEqual,
      });
      console.log(rollInfo);
      let ret = game.RegisterDiceResult(rollInfo);
      if ((ret = 1)) {
        res.send(game.SetReplyObject());
      }
      if ((ret = 0)) {
        game.action.endTurn = true;
        res.send("jailed");
      }
      break;
    case "bp":
      if (!game.action.buyProperty || req.body.from != game.turn) break;

      game.action.buyProperty = false;
      game.CurrentPlayerBuyProperty();
      res.send("et");
      break;
    case "bh":
      if (!game.action.buyHouse || req.body.from != game.turn) break;

      game.action.buyHouse = false;
      game.BuyHouse(game.turn, req.body.propIndex);
      res.send("bh");
      break;
    case "mt":
      res.send(game.Degrade(req.body.propIndex, req.body.from));
      break;
    case "et":
      if (!game.action.endTurn) break;

      game.action.endTurn = false;
      game.action.buyProperty = false;
      game.NextTurn();
      game.canRoll = true;
      res.send("et success");
      break;
    default:
      console.log("got an unhandled message!");
      break;
  }
});

app.listen(port, () => {
  console.log(`Monopoly server listening at http://localhost:${port}`);
});

class Player {
  constructor(n, img) {
    this.name = n;
    this.img = img;
    this.position = 0;
    this.money = 1500;
    this.isAlive = true;
    this.owns = {};
    console.log("generated player: \n", this);
  }
  RemoveProperty(prop) {
    for (const street in this.owns) {
      this.owns[street] = this.owns[street].filter((property) => {
        return !(property.index == prop.index);
      });
    }
  }
}

class RollInfo {
  constructor(rollInfo) {
    if (!rollInfo) {
      console.log("something go wrong when registering rollinfo");
      return;
    }
    this.isEqual = rollInfo.isEqual;
    this.from = rollInfo.from;
    this.result = rollInfo.result;
  }
}
class Property {
  constructor(data) {
    for (const a in data) {
      this[a] = data[a];
    }
    this.houseNum = 0;
  }
  Reset() {
    this.houseNum = 0;
    this.state = {};
  }
  Degrade() {
    if (this.state.owner == null) {
      return -2;
    }
    if (this.state.rent == -1) {
      this.state.rent = this.rent;
      return -1;
    }
    if (this.houseNum > 0) {
      this.houseNum--;
      this.state.rent = this[`rent${this.houseNum}`];
      return 1;
    } else {
      this.state.rent = -1;
      return 0;
    }
  }
}
let streetTotalProperty = {
  brown: 2,
  purple: 3,
  teal: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  blue: 2,
};
