/* eslint-disable no-unused-vars */
export default {
  RollDice: () => Math.floor(Math.random() * 6 + 1),

  CardTextPos: (type, i) => {
    let retStyle = {
      "font-size": "100%",
      position: "absolute",
    };
    if (i == 0 && (type == "chest" || type == "chance")) {
      retStyle.width = "40%";
      retStyle["word-wrap"] = "break-word";
      return retStyle;
    }
    if (type == "trans") {
      switch (i) {
        case 0:
          retStyle.top = "43%";
          break;
        case 5:
          retStyle.top = `${49.5 + (i - 1) * 4.55}%`;
          retStyle.left = "57.5%";
          break;
        default:
          retStyle.top = `${49.5 + (i - 1) * 3.0}%`;
          retStyle.left = "57.5%";
          break;
      }
      return retStyle;
    }
    if (type == "util") {
      retStyle.top = "68%";
      retStyle.left = "55%";
      return retStyle;
    }
    switch (i) {
      case 0:
        retStyle.top = "33%";
        break;
      case 6:
        retStyle.top = `${40.5 + (i - 1) * 3.05}%`;
        retStyle.left = "55%";
        break;
      case 7:
        retStyle.top = `${40.5 + (i - 1) * 3.12}%`;
        retStyle.left = "55%";
        break;
      case 8:
        retStyle.top = `${40.5 + (i - 1) * 3.05}%`;
        retStyle.left = "48.5%";
        break;
      case 9:
        retStyle.top = `${40.5 + (i - 1) * 2.98}%`;
        retStyle.left = "45.5%";
        break;
      default:
        retStyle.top = `${40.5 + (i - 1) * 2.8}%`;
        retStyle.left = "55%";
        break;
    }
    return retStyle;
  },
  IsValidName: (username) => {
    return /^[0-9a-zA-Z_.-]+$/.test(username);
  },
  OwnedPropertyList: (playerlist) => {
    if (!playerlist) return [];
    let ret = [];
    playerlist.forEach((element) => {
      for (const combo in element.owns) {
        ret.push(...element.owns[combo]);
      }
    });
    return ret;
  },
  HouseNumStyle: (pos) => {
    let [t, l] = GetTLForHouseNum(pos);
    return {
      position: "absolute",
      top: t,
      left: l,
    };
  },
  OwnedPropertyStyle: (pos) => {
    let [b, r] = GetBRForOPS(pos);
    return {
      width: "3%",
      height: "3%",
      position: "absolute",
      bottom: b,
      right: r,
    };
  },
  GetIconStyle: (pos, index) => {
    let [b, r] = GetBottomAndRight(pos, index);
    return {
      "max-width": "5%",
      "max-height": "5%",
      position: "absolute",
      bottom: b,
      right: r,
    };
  },
};

function GetTLForHouseNum(pos) {
  let offset = 4; //offset to normal icon position
  let region = Math.floor(pos / 10);
  let rem = pos % 10;
  switch (region) {
    case 0:
      return [`${-150}%`, `${-100}%`];

    case 1:
      return [-50 + "%", `${150}%`];

    case 2:
      return [`${180}%`, 20 + "%"];

    case 3:
      return [50 + "%", `${-175}%`];

    default:
      console.log("something go wrong at icon style");
  }
}

function GetBRForOPS(pos) {
  let offset = 4; //offset to normal icon position
  let region = Math.floor(pos / 10);
  let rem = pos % 10;
  switch (region) {
    case 0:
      return [`${6 + offset}%`, `${7 + 8 * rem}%`];

    case 1:
      return [7 + 8 * rem + "%", `${7 - offset + 4 + 10 * 8}%`];

    case 2:
      return [`${11 - offset + 10 * 8}%`, 10 + 8 * (10 - rem) + "%"];

    case 3:
      return [10 + 8 * (10 - rem) + "%", `${5 + offset + 1}%`];

    default:
      console.log("something go wrong at icon style");
  }
}
function GetBottomAndRight(pos, index) {
  let region = Math.floor(pos / 10);
  let rem = pos % 10;
  switch (region) {
    case 0:
      return [`${7 - index}%`, `${7 + 8 * rem}%`];

    case 1:
      return [7 + 8 * rem + "%", `${8 + 10 * 8 + index}%`];

    case 2:
      return [`${8 + 10 * 8 + index}%`, 7.5 + 8 * (10 - rem) + "%"];

    case 3:
      return [7 + 8 * (10 - rem) + "%", `${7 - index}%`];

    default:
      console.log("something go wrong at icon style");
  }
}
