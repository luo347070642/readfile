import ReadFileUtil from './utils/readFileUtil'

const filePath = 'D:\\文档\\项目\\细胞库\\科技平台合同'
const outPath = `./out`
const suffix = '.html'

const readFileUtil = new ReadFileUtil({ filePath, outPath, suffix })
readFileUtil.main()
