/*
 * @Author: lpy luopy4498@gmail.com
 * @Date: 2024-07-22 13:36:47
 * @LastEditors: lpy luopy4498@gmail.com
 * @LastEditTime: 2024-07-23 10:34:11
 * @FilePath: /readPdf/index.js
 * @Description:
 */
/*
 * @Author: lpy luopy4498@gmail.com
 * @Date: 2024-07-22 13:36:47
 * @LastEditors: lpy luopy4498@gmail.com
 * @LastEditTime: 2024-07-23 10:33:56
 * @FilePath: /readPdf/index.js
 * @Description:
 */

const PDFParser = require('pdf2json')
const fs = require('fs')

const fileName = '开发用-顶锐生物检测评价报告'
const basePath = './pdf'
const pdfPath = `${basePath}/${fileName}.pdf`
const outPath = `./out/${fileName}`
const pdfContent = []

const pdfParser = new PDFParser()

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError))
pdfParser.on('pdfParser_dataReady', pdfData => {
  // 解析 PDF 页面中的文本和表格内容
  const pages = pdfData.Pages
  let arrs = []
  // pages.forEach((page, pageIndex) => {
  //   page.Texts.forEach(text => {
  //     arrs.push(text.R.map(item => decodeURIComponent(item.T)))
  //   })
  // })

  const newArr = []
  // pages.forEach((page, pageIndex) => {
  //   const rows = {}
  //   page.Texts.forEach(text => {
  //     const y = text.y // 获取文本的 y 坐标
  //     const str = text.R.map(item => decodeURIComponent(item.T)).join('')

  //     if (!rows[y]) {
  //       rows[y] = []
  //     }
  //     rows[y].push(str)
  //     newArr.push({ ...text, R: text.R.map(item => decodeURIComponent(item.T)) })
  //   })

  //   // 按 y 坐标排序并打印表格内容
  //   const sortedRows = Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b))
  //   sortedRows.forEach(row => {
  //     arrs.push(rows[row].join(''))
  //   })
  // })
  pages.forEach((page, pageIndex) => {
    console.log(`Page ${pageIndex + 1}:`)
    const rows = {}

    page.Texts.forEach(text => {
      const y = text.y // 获取文本的 y 坐标
      const str = text.R.map(item => decodeURIComponent(item.T)).join('')

      if (!rows[y]) {
        rows[y] = []
      }
      rows[y].push(str)
    })

    // 按 y 坐标排序并打印表格内容
    const sortedRows = Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b))
    sortedRows.forEach(row => {
      newArr.push(rows[row].join(''))
    })
  })
  fs.writeFileSync(`${outPath}.json`, JSON.stringify(newArr, ' ', 2))
  fs.writeFileSync(`${outPath}.txt`, arrs.join('\n'))
  fs.writeFileSync(
    `${outPath}1.json`,
    JSON.stringify(
      pages.map(page => ({ ...page, Texts: page.Texts.map(text => ({ ...text, R: text.R.map(R => decodeURIComponent(R.T)) })) })),
      ' ',
      2
    )
  )
})

// pdfParser.loadPDF(pdfPath)

const pdfjsLib = require('pdfjs-dist/build/pdf')

async function readPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const pdf = await pdfjsLib.getDocument({ data }).promise

  const numPages = pdf.numPages

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    const strings = textContent.items.map(item => `${item.str}${item.hasEOL ? '\r\n' : ''}`)
    pdfContent.push(strings.join(''))
  }

  fs.writeFileSync(`${outPath}.json`, JSON.stringify(pdfContent, ' ', 2))
  fs.writeFileSync(`${outPath}.txt`, pdfContent.join('\r\n'))
}

// readPdf(pdfPath).catch(console.error)

async function readPdfTable(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const pdf = await pdfjsLib.getDocument({ data }).promise

  const numPages = pdf.numPages
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    // Collecting text items and their positions
    const rows = {}
    textContent.items.forEach(item => {
      const y = item.transform[5] // Get the y-coordinate
      const str = item.str

      if (!rows[y]) {
        rows[y] = []
      }
      rows[y].push(str)
    })

    // Sort rows by y-coordinate and print the table
    const sortedRows = Object.keys(rows).sort((a, b) => parseFloat(b) - parseFloat(a))
    const rowsData = []
    sortedRows.forEach(row => {
      // pdfContent.push(rows[row].join('\t'))
      rowsData.push(rows[row].join('\n'))
    })
    pdfContent.push(rowsData)
  }

  fs.writeFileSync(`${outPath}table.json`, JSON.stringify(pdfContent, ' ', 2))
  fs.writeFileSync(`${outPath}table.txt`, pdfContent.join('\r\n'))
}
readPdfTable(pdfPath).catch(console.error)

async function readPdfMerge(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const loadingTask = pdfjsLib.getDocument({ data })

  const pdf = await loadingTask.promise
  const numPages = pdf.numPages

  const EOLs = {}
  let tableData = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    pdfContent.push(textContent.items)
    // Collecting text items and their positions
    // const rows = {}
    // textContent.items.forEach(item => {
    //   const y = item.transform[5] // Get the y-coordinate
    //   const x = item.transform[4] // Get the x-coordinate
    //   const str = item.str

    //   if (!rows[y]) {
    //     rows[y] = []
    //   }
    //   rows[y].push({ x, str })
    // })

    // // Sort rows by y-coordinate and merge columns by x-coordinate
    // const sortedRows = Object.keys(rows).sort((a, b) => parseFloat(b) - parseFloat(a))
    // sortedRows.forEach(row => {
    //   const sortedColumns = rows[row].sort((a, b) => a.x - b.x)
    //   const rowData = sortedColumns.map(col => col.str).join('\t')
    //   tableData.push(rowData)
    // })
  }

  // Output the merged table data
  // console.log('Merged Table Data:')
  // tableData.forEach(row => console.log(row))
  const pdfItems = []
  for (let i = 0; i < pdfContent.length; i++) {
    if ((i + 1) % 2 === 0) {
      pdfItems.push(pdfContent[i])
    }
  }
  // let str = ''
  // for (let i = 0; i < pdfItems.length; i++) {
  //   const rows = pdfItems[i]
  //   for (let j = 0; j < rows.length; j++) {
  //     const row = rows[j]
  //     const y = row.transform[5]
  //     const x = row.transform[4]
  //     let joinstr = ''
  //     if (row.hasEOL) {
  //       if (x === rows[j + 1].transform[4] && y === rows[j + 1].transform[5] && rows[j + 1].str !== '') {
  //         joinstr = ''
  //       } else {
  //         joinstr = '\r\n'
  //       }
  //     }
  //     str += row.str + joinstr
  //   }
  //   str += '\r\n'
  // }

  let str = ''
  for (let i = 0; i < pdfItems.length; i++) {
    const rows = pdfItems[i]
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j]
      if (row.hasEOL) {
        if (!EOLs[i]) EOLs[i] = {}
        EOLs[i][j] = row.transform[5]
      }
    }
  }
  const EolObj = getEolKey(EOLs)
  for (let i = 0; i < pdfItems.length; i++) {
    const rows = pdfItems[i]
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j]
      const sortRow = {}
      const y = row.transform[5]
      const x = row.transform[4]
      const key = parseFloat(x) + parseFloat(y)
      let joinstr = ''
      if (row.str.trim() === '') return
      if (row.hasEOL) {
        // if (EolObj[i] && EolObj[i][j]) {
        //   joinstr = ''
        // } else {
        joinstr = '\r\n'
        // }
      }
      if (!sortRow[key]) {
        sortRow[key] = []
      }
      sortRow[key].push(row.str)

      const sortedRows = Object.keys(sortRow).sort((a, b) => parseFloat(b) - parseFloat(a))
      sortedRows.forEach(row => {
        str += sortRow[row].join('') + joinstr
      })
    }
  }
  fs.writeFileSync(`${outPath}Merged-EOL.json`, JSON.stringify(EolObj, ' ', 2))
  fs.writeFileSync(`${outPath}Merged.json`, JSON.stringify(pdfItems, ' ', 2))
  fs.writeFileSync(`${outPath}Merged.txt`, str)
}

readPdfMerge(pdfPath).catch(console.error)

function getDuplicateKeys(data) {
  const valueToKeys = {}

  // 遍历每个key-value对
  for (const [key, value] of Object.entries(data)) {
    if (!valueToKeys[value]) {
      valueToKeys[value] = []
    }
    valueToKeys[value].push(key)
  }

  // 筛选出重复的value及其对应的key
  const duplicates = {}
  const allKeys = []
  for (const [value, keys] of Object.entries(valueToKeys)) {
    if (keys.length > 1) {
      // 只有当value在多个key中出现时，才算重复
      duplicates[value] = keys
      allKeys.concat(keys)
    }
  }

  return allKeys
}

function getEolKey(obj) {
  const eolKey = Object.keys(obj)
  const eolValue = Object.values(obj)
  for (let i = 0; i < eolKey.length; i++) {
    obj[eolKey[i]] = getDuplicateKeys(eolValue[i])
  }
  return obj
}

// 加载PDF文件
async function loadPdf(url) {
  const loadingTask = pdfjsLib.getDocument(url)
  const pdfDocument = await loadingTask.promise
  return pdfDocument
}

// 提取每页的文本内容
async function extractTextFromPage(page) {
  const textContent = await page.getTextContent()
  const items = textContent.items.map(item => ({
    str: item.str,
    x: item.transform[4], // X坐标
    y: item.transform[5], // Y坐标
    width: item.width,
    height: item.height,
    hasEOL: item.hasEOL
  }))
  return items
}

// 主函数
;(async function () {
  const url = pdfPath // PDF文件路径
  const pdfDocument = await loadPdf(url)

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i)
    const textItems = await extractTextFromPage(page)

    // 输出每页的文本及其位置信息
    console.log(`Page ${i}:`)
    textItems.forEach(item => {
      // console.log(`Text: ${item.str}, X: ${item.x}, Y: ${item.y}, hasEOL: ${item.hasEOL}`)
    })
    // fs.writeFileSync(
    //   `./out/datas/${i}.json`,
    //   textItems.map(item => `Text: ${item.str}, width: ${item.width}, height: ${item.height}, X: ${item.x}, Y: ${item.y}, hasEOL: ${item.hasEOL}`).join('\n')
    // )

    // 在这里实现逻辑判断合并单元格
  }
})()
