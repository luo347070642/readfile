const pdf_table_extractor = require('pdf-table-extractor')
const fs = require('fs')

const fileName = '开发用-顶锐生物检测评价报告'
const basePath = './pdf'
const pdfPath = `${basePath}/${fileName}.pdf`
const outPath = `./out/${fileName}`
function success(result) {
  const tables = result.pageTables.map((item, i) => {
    return item.tables
      .map(row => {
        return row
          .map(col => {
            // if (col.split('\n').length > 7) {
            //   const txt = col.replace('\n', '')
            //   console.log(i, txt)
            // }
            if (col.trim() === '') return '\t'
            return col.trim()
          })
          .join('')
      })
      .filter(item => {
        item = item.replace(/\t/g, '').trim()
        return item !== ''
      })
  })
  fs.writeFileSync(
    `${outPath}-table.json`,
    JSON.stringify(
      result.pageTables.map(item => item.tables),
      ' ',
      2
    )
  )
  fs.writeFileSync(`${outPath}-table.min.json`, JSON.stringify(tables, ' ', 2))
  fs.writeFileSync(
    `${outPath}-table.txt`,
    result.pageTables.map(item => item.tables.map(row => row.map(col => (col.trim() === '' ? ' | \t' : col)).join('')).join('\r\n')).join('\r\n')
  )
  // fs.writeFileSync(`${outPath}-table.txt`, result.pageTables.map(
  //   item =>
  //     item.tables.map(row =>
  //       row.map(col => col.trim() === '' ? '\t' : '')
  //     )
  //   ).join('\r\n'))
  // )
  // 你可以在这里处理提取到的表格数据
}

function error(err) {
  console.error('Error: ' + err)
}

pdf_table_extractor(pdfPath, success, error)
