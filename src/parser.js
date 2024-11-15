import { exprToSQL } from './expr'
import parsers from './parser.all'
import astToSQL from './sql'
import { DEFAULT_OPT, setParserOpt } from './util'

class Parser {

  /*
    parse SQL text to AST object
    @public
    @param {string} sql
    @param {object} opt option parameters
    @return AST
  */
  astify(sql, opt = DEFAULT_OPT) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.ast
  }

  /*
    convert AST object to sql query
    @public
    @param {object:AST} ast
    @param {object} opt option parameters
    @return string
  */
  sqlify(ast, opt = DEFAULT_OPT) {
    setParserOpt(opt)
    return astToSQL(ast, opt)
  }

  /*
    convert expr statement to expr object
    @public
    @param {object:Expr} expr
    @param {object} opt option parameters
    @return string
    @return string
  */
  exprToSQL(expr, opt = DEFAULT_OPT) {
    setParserOpt(opt)
    return exprToSQL(expr)
  }

  /*
    parse sql into object
    @private
  */
  parse(sql, opt = DEFAULT_OPT) {
    const { database = (PARSER_NAME || 'mysql') } = opt
    setParserOpt(opt)
    const typeCase = database.toLowerCase()
    if (parsers[typeCase]) return parsers[typeCase](opt.trimQuery === false ? sql : sql.trim(), opt.parseOptions || DEFAULT_OPT.parseOptions)
    throw new Error(`${database} is not supported currently`)
  }

  /*
    @private
  */
  whiteListCheck(sql, whiteList, opt = DEFAULT_OPT) {
    if (!whiteList || whiteList.length === 0) return
    const { type = 'table' } = opt
    if (!this[`${type}List`] || typeof this[`${type}List`] !== 'function') throw new Error(`${type} is not valid check mode`)
    const checkFun = this[`${type}List`].bind(this)
    const authorityList = checkFun(sql, opt)
    let hasAuthority = true
    let denyInfo = ''
    for (const authority of authorityList) {
      let hasCorrespondingAuthority = false
      for (const whiteAuthority of whiteList) {
        const regex = new RegExp(whiteAuthority, 'i')
        if (regex.test(authority)) {
          hasCorrespondingAuthority = true
          break
        }
      }
      if (!hasCorrespondingAuthority) {
        denyInfo = authority
        hasAuthority = false
        break
      }
    }
    if (!hasAuthority) throw new Error(`authority = '${denyInfo}' is required in ${type} whiteList to execute SQL = '${sql}'`)
  }

  /*
    @private
  */
  tableList(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.tableList
  }

  /*
    @private
  */
  columnList(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.columnList
  }
}

export default Parser
