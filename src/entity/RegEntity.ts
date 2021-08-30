class RegEnum {
  static regTest = /^([一,二,三,四,五,六,七,八,九,十]{1,10}、{1}|第[一,二,三,四,五,六,七,八,九,十]{1,10}条)/
  static rmbReg = /(人民币[\s,\w]+元|￥[\s,\w]+元)/
  static numeralMaxReg = /大写：[\s\S]+万[\s\S]+仟[\s\S]+佰[\s\S]+拾[\s\S]+元整/
  static lowerCaseLetterReg = /^[a-z]+./
  static titleLetterReg = /^i+./
  static accountReg = /(户(\S?|\W+)名：?)|(开户行：)|(账(\S?|\W+)号：?)|(汇款备注：)/
  static countReg = /细胞[\s,\w]+管/
  static countReg1 = /存储管数为[\s,\w]+管/
  static titleNumReg = /^\d+(.\d+)?(.\d+)?(.\d+)?(.\d+)?/
  static titleNumReg2 = /(（\d+）)/
  static tableReg =
    /(储存(\S?|\W+)类型)|(存储管数)|(数量标准)|(低于处理方式)|(PBMC存储)|(^脐带干细胞)|(^胎盘干细胞)|(^围产期干细胞同存)|(^补采\S+退存)|(^\d+管)/
}

export default RegEnum
