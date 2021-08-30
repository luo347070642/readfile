const rfUtil = require('./readFileUtil')

const filePath = 'D:\\文档\\项目\\细胞库\\科技平台合同'
const outPath = `./out`
const suffix = '.vue'

rfUtil.main(filePath, outPath, suffix)
