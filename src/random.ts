let fractal = 0;
export function setFractal(num: number) {
  fractal = num;
}
export const random = (number: number) => {
  if (number < 1) {
    number = Math.abs(number * 1000);
  }
  return randomArray[Math.floor((number + fractal) % (randomArray.length - 1))];
};
export function getFractal(x: number, y: number) {
  return x * y + y + x;
}
const randomArray = [
  0.8862171073384657, /// no brake
  0.5631818739240353,
  0.31316770745669387,
  0.46682390176062527,
  0.6977667310470947,
  0.41278263020910533,
  0.046805479083248835,
  0.3260230054754749,
  0.6912187228423807,
  0.898649933529827,
  0.47355892498554475,
  0.5426076752462305,
  0.2004340591895628,
  0.036807619405565095,
  0.14849556802130182,
  0.6423259428713233,
  0.19861622932595902,
  0.3778117848850455,
  0.7100648766611386,
  0.03256617354168889,
  0.6452173109794794,
  0.3798599002268368,
  0.9857207798829235,
  0.18332453981628305,
  0.27020425703468764,
  0.7274262690824436,
  0.43331260326053234,
  0.7187337145070116,
  0.6934850703022275,
  0.5857958288404896,
  0.9812507477138745,
  0.9844690052624889,
  0.5058888824223273,
  0.9346978155947732,
  0.4581382402703813,
  0.9764922130780092,
  0.6431516595589013,
  0.01777152429429396,
  0.8803755348947138,
  0.7405425722111423,
  0.735947594314621,
  0.1903654566430628,
  0.7537405845535499,
  0.21739349137635156,
  0.2603398216741073,
  0.7447359318130244,
  0.9891079669850087,
  0.3384114602580317,
  0.8117139806711664,
  0.0964059241816626,
  0.7746388067201992,
  0.9266309940447,
  0.4108339857001919,
  0.9178725997374648,
  0.6456920088267832,
  0.34460807943420435,
  0.8648998886897383,
  0.44462465704510445,
  0.0552222293838629,
  0.31295826283138006,
  0.05667666380657499,
  0.9621769975879095,
  0.16350398260782129,
  0.9589183530508578,
  0.23695133627996046,
  0.9971840635779123,
  0.7067021685755643,
  0.7632662694819914,
  0.6573473065088229,
  0.23531798605014642,
  0.7333060725425005,
  0.884245085460178,
  0.8469021921822086,
  0.7209035764067955,
  0.07298284160156432,
  0.9996283453762256,
  0.17387434923845513,
  0.2971807268636699,
  0.2536974104103722,
  0.6413840841703424,
  0.9889212967435654,
  0.13242941768570748,
  0.366792977397137,
  0.05043571484865339,
  0.9842966398965287,
  0.871288795080917,
  0.09076991108796872,
  0.03455373687141372,
  0.6405870598277759,
  0.16210299839940667,
  0.17016322959809171,
  0.09545422840157158,
  0.9141784728997293,
  0.24815878920893697,
  0.10602674570003123,
  0.09213461876416451,
  0.6722962412335312,
  0.35864637809182676,
  0.10423194495739563,
  0.6621616971633801,
  0.6824898857638397,
  0.7121054760506043,
  0.2835023777601269,
  0.8332869017269993,
  0.7624593223173448,
  0.22484686222260342,
  0.8051482684119822,
  0.744173203165668,
  0.04826205818754925,
  0.3719361936376291,
  0.48854985017601993,
  0.6473831569825954,
  0.46410366072892684,
  0.6893437369965709,
  0.3302098771259254,
  0.46393995991828363,
  0.2446509734382225,
  0.28506135968992585,
  0.07391970078771082,
  0.5011255565846144,
  0.5874128363891202,
  0.9078189126733593,
  0.22122589062948528,
  0.368877477322215,
  0.11268943272720877,
  0.788953845998944,
  0.7406235228849991,
  0.5350851996809931,
  0.17494155171554504,
  0.040652117858943626,
  0.783518425284341,
  0.6049344950008153,
  0.20699017062215308,
  0.007625542498048921,
  0.736903254720076,
  0.7912991604621604,
  0.9858154702987587,
  0.6353407597222935,
  0.9669373824486642,
  0.5007196464640022,
  0.7176901996657288,
  0.19020367001310312,
  0.8300282151744982,
  0.9164444274827224,
  0.32256131454027437,
  0.8422090334718464,
  0.6437887110650347,
  0.07111470465497294,
  0.9492642013235968,
  0.9608697244629221,
  0.7280395434473934,
  0.8758425338534364,
  0.9502951694037001,
  0.9085546712862855,
  0.21939195878005924,
  0.6973138313012095,
  0.5144673628335419,
  0.89230416219125,
  0.437111143133041,
  0.5602495693097922,
  0.49152274307220445,
  0.6430637045546124,
  0.9604102580754219,
  0.6480503029380849,
  0.5725977135262355,
  0.0826388757351828,
  0.7715680907552851,
  0.7735859261219711,
  0.8717912270830288,
  0.8301768068385276,
  0.9275436284237346,
  0.2193843134964948,
  0.6484919131491405,
  0.7754874642343268,
  0.12000995792369085,
  0.09509012122202742,
  0.10823906834893782,
  0.5129322412792254,
  0.14704236265757298,
  0.49730835559032505,
  0.19828741632559455,
  0.21095198185818265,
  0.38218133388116726,
  0.7382204435606929,
  0.7308117627339172,
  0.28250936405847216,
  0.47791511244610474,
  0.6526275375375528,
  0.18675135938381482,
  0.05933505665717309,
  0.5168308786549989,
  0.15086432447580833,
  0.3979273769342411,
  0.3594952967366205,
  0.04947402582043825,
  0.11992970766397515,
  0.919009324799575,
  0.5050412960074429,
  0.41450691226650505,
  0.9471032736517728,
  0.6938014225830245,
  0.7295279471069469,
  0.4923240492759702,
  0.34732504008670406,
  0.21774066303521922,
  0.42901694891708586,
  0.18498819563430313,
  0.44588055492653034,
  0.9348673458098438,
  0.8356892208570987,
  0.24927091851151717,
  0.07775902461426987,
  0.6518903425210634,
  0.5181877544592606,
  0.452762890711619,
  0.6943186851878096,
  0.2776617432285513,
  0.7442115881400775,
  0.5001029342360221,
  0.9379877814170683,
  0.981103604282753,
  0.5716864585053976,
  0.575241324580299,
  0.4861826288679265,
  0.3035234969697014,
  0.5226091984885537,
  0.47210343956545353,
  0.5721643489874868,
  0.5219538729800779,
  0.8487744101709345,
  0.3275526832109321,
  0.3841783892330499,
  0.36391430192925456,
  0.24344635062584974,
  0.30692281476822236,
  0.007187895985842241,
  0.3287129529703716,
  0.12441221352634568,
  0.8701576689444468,
  0.8436555968990913,
  0.560802403218621,
  0.04733995556167936,
  0.5961555368614904,
  0.29551349540509797,
  0.8869611249336371,
  0.5494705606314054,
  0.8638112184261553,
  0.4186508928619166,
];
