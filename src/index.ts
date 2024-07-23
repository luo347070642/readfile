/*
 * @Author: lpy luopy4498@gmail.com
 * @Date: 2022-02-27 22:11:13
 * @LastEditors: lpy luopy4498@gmail.com
 * @LastEditTime: 2024-07-23 19:51:59
 * @FilePath: /readfile/src/index.ts
 * @Description:
 */
import ReadFileUtil from './utils/readFileUtil'

const filePath = 'D:\\文档\\项目\\细胞库\\科技平台合同'
const outPath = `./out`
const suffix = '.html'

const readFileUtil = new ReadFileUtil({ filePath, outPath, suffix })
readFileUtil.main()
