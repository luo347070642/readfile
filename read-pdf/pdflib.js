const pdfjsLib = require('pdfjs-dist/build/pdf')
const fs = require('fs')

const fileName = '开发用-顶锐生物检测评价报告'
const basePath = './pdf'
const pdfPath = `${basePath}/${fileName}.pdf`
const outPath = `./out/${fileName}`
const pdfContent = []

// 加载 PDF 文件
export async function loadPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const loadingTask = pdfjsLib.getDocument({ data })
  const pdfDocument = await loadingTask.promise
  return pdfDocument
}

// 提取页面文本
export async function extractTextFromPage(page) {
  const textContent = await page.getTextContent()
  return textContent.items.map(item => ({
    text: item.str,
    x: item.transform[4],
    y: item.transform[5],
    hasEOL: item.hasEOL
  }))
}

// 分析文本块，识别合并单元格
export function analyzeTextBlocks(textItems) {
  const rows = {}

  textItems.forEach(item => {
    const yKey = Math.round(item.y) // 对 Y 坐标取整，分组相同行
    if (!rows[yKey]) {
      rows[yKey] = []
    }
    rows[yKey].push(item)
  })

  // 处理每一行的文本块
  const tableData = Object.keys(rows).map(y => {
    const row = rows[y]
    // 按 X 坐标排序文本块
    row.sort((a, b) => a.x - b.x)
    // 合并有 EOL 的文本块
    const mergedRow = row.reduce((acc, item, index) => {
      if (index > 0 && item.x === row[index - 1].x && row[index - 1].hasEOL) {
        acc[acc.length - 1].text += ` ${item.text}`
      } else {
        acc.push(item)
      }
      return acc
    }, [])
    return mergedRow.map(item => item.text)
  })

  return tableData
}

function outputPdfContent() {
  const filePath = pdfPath
  const pdfDocument = await loadPdf(filePath)

  let tableStr = ''
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i)
    const textItems = await extractTextFromPage(page)

    // 分析并输出表格数据
    const tableData = analyzeTextBlocks(textItems)
    console.log(`Page ${i} Table Data:`, tableData)

    tableStr += `${tableData
      .reverse()
      .map(item => item.join(''))
      .join('\r\n')}`
    fs.writeFileSync(
      `./out/datas/table${i}.json`,
      JSON.stringify(
        tableData.map(item => item.join('')),
        null,
        2
      )
    )
  }

  fs.writeFileSync(`${outPath}tableMarge.txt`, tableStr)
}
