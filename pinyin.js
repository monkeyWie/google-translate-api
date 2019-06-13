const translate = require("./index");
const _ = require("lodash");

const token_ym = [
  "a",
  "ā",
  "á",
  "ǎ",
  "à",
  "o",
  "ō",
  "ó",
  "ǒ",
  "ò",
  "e",
  "ē",
  "é",
  "ě",
  "è",
  "i",
  "ī",
  "í",
  "ǐ",
  "ì",
  "u",
  "ū",
  "ú",
  "ǔ",
  "ù",
  "ü",
  "ǖ",
  "ǘ",
  "ǚ",
  "ǜ",
  "ai",
  "āi",
  "ái",
  "ǎi",
  "ài",
  "ei",
  "ēi",
  "éi",
  "ěi",
  "èi",
  "ui",
  "uī",
  "uí",
  "uǐ",
  "uì",
  "ue",
  "uē",
  "ué",
  "uě",
  "uè",
  "uen",
  "uēn",
  "uén",
  "uěn",
  "uèn",
  "ao",
  "āo",
  "áo",
  "ǎo",
  "ào",
  "ou",
  "ōu",
  "óu",
  "ǒu",
  "òu",
  "ia",
  "iā",
  "iá",
  "iǎ",
  "ià",
  "iu",
  "iū",
  "iú",
  "iǔ",
  "iù",
  "ie",
  "iē",
  "ié",
  "iě",
  "iè",
  "iao",
  "iāo",
  "iáo",
  "iǎo",
  "iào",
  "iou",
  "iōu",
  "ióu",
  "iǒu",
  "iòu",
  "üe",
  "üē",
  "üé",
  "üě",
  "üè",
  "er",
  "ēr",
  "ēr",
  "ēr",
  "ēr",
  "an",
  "ān",
  "án",
  "ǎn",
  "àn",
  "en",
  "ēn",
  "én",
  "ěn",
  "èn",
  "in",
  "īn",
  "ín",
  "ǐn",
  "ìn",
  "ian",
  "iān",
  "ián",
  "iǎn",
  "iàn",
  "ua",
  "uā",
  "uá",
  "uǎ",
  "uà",
  "un",
  "ūn",
  "ún",
  "ǔn",
  "ùn",
  "uo",
  "uō",
  "uó",
  "uǒ",
  "uò",
  "uai",
  "uāi",
  "uái",
  "uǎi",
  "uài",
  "uan",
  "uān",
  "uán",
  "uǎn",
  "uàn",
  "uei",
  "uēi",
  "uéi",
  "uěi",
  "uèi",
  "ün",
  "ǖn",
  "ǘn",
  "ǚn",
  "ǜn",
  "üan",
  "üān",
  "üán",
  "üǎn",
  "üàn",
  "ang",
  "āng",
  "áng",
  "ǎng",
  "àng",
  "eng",
  "ēng",
  "éng",
  "ěng",
  "èng",
  "ing",
  "īng",
  "íng",
  "ǐng",
  "ìng",
  "ong",
  "ōng",
  "óng",
  "ǒng",
  "òng",
  "iang",
  "iāng",
  "iáng",
  "iǎng",
  "iàng",
  "uang",
  "uāng",
  "uáng",
  "uǎng",
  "uàng",
  "ueng",
  "uēng",
  "uéng",
  "uěng",
  "uèng",
  "iong",
  "iōng",
  "ióng",
  "iǒng",
  "iòng"
].sort((m1, m2) => m2.length - m1.length);

const token_sm = [
  "b",
  "p",
  "m",
  "f",
  "d",
  "t",
  "n",
  "l",
  "g",
  "k",
  "h",
  "j",
  "q",
  "x",
  "r",
  "z",
  "c",
  "s",
  "y",
  "w",
  "zh",
  "ch",
  "sh"
].sort((m1, m2) => m2.length - m1.length);

/**
 * 输入一组词库，返回词库对应的拼音
 */
async function pinyin(words, opts, httpOpts) {
  if (words && words.length) {
    // google返回的第一个拼音是大写，这里特殊处理
    const text = "拼音," + words.join(",");
    const result = await translate(text, opts || {}, httpOpts || {});
    // 翻译结果忽略第一个词，并做拼音切割
    return result.pronunciation
      .split(",")
      .slice(1)
      .map(p => splitPy(splitQuote(splitSpace(p.trim()))));
  }
  return [];
}

// 按空格切割
function splitSpace(p) {
  return p.split(" ");
}

// 按'切割
function splitQuote(arr) {
  return _.flatten(arr.map(p => p.split("'")));
}

// 按声母韵母切分
function splitPy(arr) {
  return _.flatten(
    arr.map(p => {
      //如果开头是韵母
      const arr = [];
      let s = p;
      let l = -1;
      while ((l = startWithYm(s)) != -1) {
        arr.push(s.substring(0, l));
        s = s.substring(l);
      }
      //每组声母韵母为一个拼音
      if (s.length > 0) {
        let l2 = -1;
        while ((l = startWithSm(s)) != -1) {
          l2 = startWithYm(s.substring(l));
          if (l2 == -1) {
            break;
          }
          arr.push(s.substring(0, l + l2));
          s = s.substring(l + l2);
        }
      }
      return arr;
    })
  );
}

function startWithYm(s) {
  return startWithTokens(s, token_ym);
}

function startWithSm(s) {
  return startWithTokens(s, token_sm);
}

function startWithTokens(s, tokens) {
  if (s.length <= 0) {
    return -1;
  }
  for (let token of tokens) {
    if (s.match(`^${token}.*$`)) {
      return token.length;
    }
  }
  return -1;
}

module.exports = pinyin;
