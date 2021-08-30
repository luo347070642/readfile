import mammoth from 'mammoth'

import log4js from 'log4js'
import fs from 'fs'
import path from 'path'
import config from '../config/logconf'

log4js.configure(config)
const logger = log4js.getLogger('logger')
// log4js.connectLogger(logger, { level: 'debug' })

const regTest = /^([一,二,三,四,五,六,七,八,九,十]{1,10}、{1}|第[一,二,三,四,五,六,七,八,九,十]{1,10}条)/
const rmbReg = /(人民币[\s,\w]+元|￥[\s,\w]+元)/
const numeralMaxReg = /大写：[\s\S]+万[\s\S]+仟[\s\S]+佰[\s\S]+拾[\s\S]+元整/
const lowerCaseLetterReg = /^[a-z]+./
const titleLetterReg = /^i+./
const accountReg = /(户(\S?|\W+)名：?)|(开户行：)|(账(\S?|\W+)号：?)|(汇款备注：)/
const countReg = /细胞[\s,\w]+管/
const countReg1 = /存储管数为[\s,\w]+管/
const titleNumReg = /^\d+(.\d+)?(.\d+)?(.\d+)?(.\d+)?/
const titleNumReg2 = /(（\d+）)/
const tableReg =
  /(储存(\S?|\W+)类型)|(存储管数)|(数量标准)|(低于处理方式)|(PBMC存储)|(^脐带干细胞)|(^胎盘干细胞)|(^围产期干细胞同存)|(^补采\S+退存)|(^\d+管)/

interface ParamVo {
  filePath: string
  outPath: string
  suffix: string
}

const fileOpts: any = {
  IcStorageServiceTripartite: '1、免疫细胞存储技术服务三方协议（宁波海益专用） ',
  IcCollectInformedConsentTripartite: '1-1三方线上---免疫细胞采集知情同意书终版（宁波海益） ',
  IcStorageService: '2、免疫细胞存储技术服务协议（宁波海益专用） ',
  IcCollectInformedConsentBothSides: '2-1双方---免疫细胞采集知情同意书（宁波海益） ',
  PscStorageServiceTripartite: '3-1围产期干细胞存储技术服务三方协议(宁波海益) ',
  PscCollectInformedConsentTripartite: '3-三方线上---围产期干细胞采集知情同意书终版 ',
  PscStorageService: '4、围产期干细胞存储技术服务协议（宁波海益） ',
  PscCollectInformedConsentBothSides: '4-1双方--围产期采集知情同意书（宁波海益） ',
  AscStorageServiceTripartite: '5、脂肪干细胞存储技术服务三方协议（宁波海益） ',
  AscCollectInformedConsentTripartite: '5-1三方线上---脂肪干细胞采集知情同意书终版 ',
  AscStorageService: '6、脂肪干细胞存储技术服务协议（宁波海益） ',
  AscCollectInformedConsentBothSides: '6-1双方---脂肪干细胞采集知情同意书（宁波海益） '
}
class ReadFile {
  filePath: string = ''
  outPath: string = ''
  suffix: string = ''

  constructor(opts: ParamVo) {
    this.filePath = opts.filePath
    this.outPath = opts.outPath
    this.suffix = opts.suffix
  }
  main() {
    const createNewFileNames: string[] = [`./out/routes.txt`, `${this.outPath}/component.txt`]
    try {
      logger.info(`初始化配置......`)
      createNewFileNames.forEach(item => this.createNewFile(item))
      logger.info(`开始读写文件.....`)
      this.readFileByDir(this.filePath, this.outPath)
    } catch (error) {
      logger.error(`读写失败,报错信息：${error}`)
    }
  }
  regReplace(fileName: string, txtArr: string[], item: any, i: number) {
    if (item.includes('知情同意书') || /(签字|签名)(\W?\S?|\W+\S+)：+/.test(item)) {
      item = ''
    }
    if (rmbReg.test(item)) {
      item = item.replace(rmbReg, `${/￥[\s,\w]+元/.test(item) ? '￥' : '人民币'}<span>{{money}}</span>元`)
    }
    if (numeralMaxReg.test(item)) {
      item = item.replace(
        numeralMaxReg,
        `大写：<b v-for='(item, index) in amountInWords' :key='index'><span v-show='index % 2 === 0'>{{item}}</span><b v-show='index % 2 !== 0'>{{item}}</b></b>`
      )
    }
    const txt = item
    // if (countReg.test(item)) {
    //   item = item.replace(countReg, `细胞<span>{{item.content}}</span>管`)
    // }
    // if (countReg1.test(item)) {
    //   item = item.replace(countReg1, `存储管数为~<span>{{item.content}}</span>管`)
    // }
    if (fileName.includes('InformedConsent') && /\d+、/.test(item)) {
      item = `<div class="title">${txt}</div>`
    } else if (regTest.test(item)) {
      item = fileName.includes('InformedConsent') ? `<p>${txt}</p>` : `<div class="title">${txt}</div>`
    } else if (/≥\d+.?\d?×/.test(item)) {
      item = `<td>${txt}</td>`
    } else if (/^(\d+|【(\W?\S?|\W+\S+))管/.test(item)) {
      if (txtArr[i + 2] !== item && /^(【(\W?\S?|\W+\S+))管/.test(item)) {
        item = `<td>${txt}</td></tr></table>`
      } else {
        item = /^(\d+)管/.test(item) ? `<td>${txt}</td>` : `<td>${txt}</td></tr>`
      }
    } else if (titleNumReg.test(item)) {
      const tempArr = item.split('').filter((str: string) => str === '.')
      if (tempArr.length === 1) {
        item = `<p>${txt}</p>`
        if (i < txtArr.length - 1) {
          const nextItem = txtArr[i + 1]
          const tempArr2 = nextItem.split('').filter(str => str === '.')
          if (tempArr2.length > 1 || /(户(\S?|\W+)名：?)/.test(nextItem)) {
            item = `<div class="small">${txt}</div>`
          } else if (lowerCaseLetterReg.test(nextItem) || titleNumReg2.test(nextItem)) {
            item = `<div class="detail">${txt}</div>`
          }
        }
        if (fileName.includes('InformedConsent')) {
          item = `<div class="detail">${txt}</div>`
        }
      } else {
        item = `<div class="detail">${txt}</div>`
        if (i < txtArr.length - 1) {
          const nextItem = txtArr[i + 1]
          const tempArr2 = nextItem.split('').filter(str => str === '.')
          if (
            (tempArr2.length === 1 || regTest.test(nextItem)) &&
            !lowerCaseLetterReg.test(nextItem) &&
            !titleNumReg2.test(nextItem)
          ) {
            item = `<div class="detail last-detail">${txt}</div>`
          }
        }
      }
    } else if (titleLetterReg.test(item)) {
      item = `<div class="second">${txt}</div>`
    } else if (lowerCaseLetterReg.test(item)) {
      item = `<div class="third">${txt}</div>`
    } else if (accountReg.test(item)) {
      item = /(汇款备注：)/.test(item) ? `<p>${txt}</p>` : `<div class="account">${txt}</div>`
    } else if (titleNumReg2.test(item)) {
      item = `<div class="detail">${txt}</div>`
      if (i < txtArr.length - 1) {
        const nextItem = txtArr[i + 1]
        if (lowerCaseLetterReg.test(nextItem)) {
          item = `<div class="detail">${txt}</div>`
        }
      }
    } else if (/注：\S+/.test(item)) {
      item = `<div class="detail last-detail">${txt}</div>`
    } else if (tableReg.test(item)) {
      if (/储存(\S?|\W+)类型/.test(item)) {
        item = `<table><tr><td>${txt}</td>`
      } else if (/存储管数/.test(item) && /储存细胞类型/.test(txtArr[i - 1])) {
        item = `<td>${txt}</td></tr>`
      } else if (/低于处理方式/.test(item)) {
        item = `<td>${txt}</td></tr>`
      } else if (/(^脐带干细胞)|(^胎盘干细胞)|(^围产期干细胞同存)|PBMC存储/.test(item)) {
        item = `<tr><td>${txt}</td>`
      } else if (/^补采\S+退存/.test(item)) {
        if (txtArr[i + 4] !== item && !item.includes('补采或退存')) {
          item = `<td>${txt}</td></tr></table>`
        } else {
          item = `<td>${txt}</td></tr>`
        }
      } else {
        item = `<td>${txt}</td>`
      }
    } else if (/甲方声明：\S+/.test(item)) {
      item = `<p class='line'>${txt}</p>`
    } else {
      item = item.trim().length > 1 ? `<p>${txt}</p>` : null
      if (i < txtArr.length - 1) {
        const nextItem = txtArr[i + 1]
        if ((lowerCaseLetterReg.test(nextItem) || titleNumReg2.test(nextItem)) && !regTest.test(nextItem)) {
          item = `<div class="detail">${txt}</div>`
        }
      }
    }
    return item
  }
  readFileByDir(dir: string, outPath: string) {
    const files = fs.readdirSync(dir)
    files.forEach(async fileName => {
      const fullPath = path.join(dir, fileName)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        this.readFileByDir(path.join(dir, fileName), path.join(outPath, fileName))
      } else {
        if (!fileName.includes('~$')) {
          await this.readFile(fileName, dir, outPath)
        }
      }
    })
  }
  readFile(fileName: string, filePath: string, outPath: string) {
    let tempPath = '../../template/word.vue.ftl'
    mammoth
      .extractRawText({ path: `${filePath}\\${fileName}` })
      .then((result: { value: any }) => {
        const newTxtArr: string[] = []
        let content = result.value
        let index = content.indexOf('共同声明')
        index = index < 0 ? content.indexOf('鉴于') : index
        index = index < 0 ? content.indexOf('一、') : index
        let lastIndex = content.indexOf('（以下无正文）')
        lastIndex = lastIndex < 0 ? content.length : lastIndex
        // 截取有效内容
        content = JSON.stringify(content.substring(index, lastIndex))
        const txtArr = content.split('\\n\\n')
        let isContinue = true
        txtArr.forEach((item: string, i: number) => {
          item = '' + item.replace('<', '&lt;').replace('>', '&gt;').replace('"', '')
          if (/（本页无正文/.test(item)) isContinue = false
          item = isContinue ? this.regReplace(fileName, txtArr, item, i) : false
          if (item) newTxtArr.push(item)
        })
        tempPath = fileName.includes('InformedConsent') ? '../../template/word.vue.terms.ftl' : tempPath
        // 读取模板内容
        let tempStr = fs.readFileSync(tempPath, 'utf-8')
        tempStr = tempStr.replace('{{ fileContent }}', newTxtArr.join('\n        '))
        // 生产目录及文件
        fs.mkdir(outPath, () => {
          const fName = fileName.split('.')[0]
          const file = `${fName}${this.suffix}`
          fs.writeFileSync(`${outPath}\\${file}`, tempStr)
          // 生成对应的 routes配置内容 文件
          let routesStr = fs.readFileSync('./out/routes.txt', 'utf-8')
          routesStr += `
        {
          path: '/${fName}',
          name: '${fName}',
          meta: {
            title: '${fName}'
          },
          component: ${fName}
        },`
          let componentStr = fs.readFileSync('./out/component.txt', 'utf-8')
          componentStr += `
        // ${fileOpts[fName]}
        const ${fName} = (resolve) => {
          import('@/page/nBTermsAndAgreements/${fName}').then((module) => {
            resolve(module)
          })
        }`
          fs.writeFileSync('./out/component.txt', componentStr)
          fs.writeFileSync('./out/routes.txt', routesStr)
          logger.info(`写入成功，文件路径： ${outPath}\\${file} `)
        })
      })
      .done()
  }
  createNewFile(path: string) {
    fs.access(path, fs.constants.F_OK, err => {
      if (!err) {
        fs.unlinkSync(path)
      }
      fs.writeFileSync(path, '')
    })
  }
}

export default ReadFile
