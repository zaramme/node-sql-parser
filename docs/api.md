# API Documentation

##  class `Parser`
Parser is the core class of node-sql-parser.
Most basic API is provided by this class.

### `new Parser()`

instantiate Parser class.

```
import { Parser } from 'node-sql-parser'
parser = new Parser()
```

- No parmeter requires to instatitiate this class.
- The instances never possess any state. therefore you can use it as just set of methods likewise util class.

Most class returns some representative type of object: [AST](#ast), [expr](#expr), ...
If you need to manupilate the content of them, you can access directry as object or array to extract or insert/update/delete you need.


### `Parser.astify(sql:string, opt:): AST`
Receives SQL as plain text and returns AST.
You can also provide optional parameter as OPT.
For more information of AST object, see [Type Documentation](#type-documentation) below.

### `Parser.sqlify(ast:AST): string`
It works inversely in `astify()`. so this method returns SQL text from AST object.

### `Parser.exprToSQL(expr:expr): string`
Receives [expr](#interface-expr) object and convert into string.

# Type Documentation

## `interface AST`

In this library, type AST(abstruct syntax tree) corresponds sql query.

the interface will be varied according to SQL statement and its context, however it's easy to look over inside by `console.log()` or other debug methods since AST is simple json object.

### select statement

here's typical properties if select statement is parsed.
property list could be vary depends on what query express.

```
AST: {
  type: "select";
  columns: ExAstColumn[] | "*";
  from: Array<ExFrom> | null;
  where: AstWhere;
  groupby: ExprNode[] | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
}
```


### subquery, UNION and WITH statement

AST possibly refer to another AST object recursively if query contains subquery, UNION, or WITH statement.

### WITH
```
  with: {
    name: {
      type: string
      value: string
    }
    stmt: {
      ast: AST // query as WITH
    }
  }
  type: "select";
  columns: ExAstColumn[] | "*";
  from: Array<From> | null;
```

### UNION
```
  type: "select";
  columns: ExAstColumn[] | "*";
  from: Array<From> | null;

  // parameters for union statement
  set_op: 'union'
  _next: ExAstSelect // query as UNION
```

## `interface expr`

interface `expr` is corresponds one section of SQL statement.
most statement property is described by array of exprs.

- column specification in select statement
- SQL functions
- condition in where statement
- simple value (integer, string, float ...)...


## expr for column specification
```
columns:[
  {
    expr: {
      type: "column_ref";
      table: string | null;
      column: string;
    }
    as: "name"
  },
  ...
]
```

## expr for SQL function
To compose SQL Function, Function statement itself is described as expr interface,
And each argumant will also be described as expr too.

```
columns:[
  // CONCAT('Mr', t1.name) as `name_with_title`
  {
    expr: {
      type: "function";
      name: 'CONCAT';
      args: {
        type: "expr_list",
        value: [
          {
            type: 'backticks_quote_string'
            value: 'Mr.'
          },
          {
            type: "column_ref";
            table: "t1";
            column: "name";
          },
        ]
      };
    }
    as: "name_with_title"
  },
  ...
]
```

## expr in WHERE statement

conditional statements such as WHERE will be formatted by binary tree.
each tree node has left and right branch and they could be expr or another tree node.

```
// WHERE `name` = 'John' and `email` != null
where: [
{
  type: "binary_expr"
  operator: "and"
  left: {
    type: "binary_expr"
    type: "="
    left: {
      type: "column_ref"
      column: 'name'
    },
    right: {
      type: 'backticks_quote_string'
      value: "John"
    }
  },
  right: {
    type: "binary_expr"
    operator: "!="
    left: {
      type: "column_ref"
      column: 'email'
    },
    right: {
      type: 'null'
    }
  }
}]
```

and you can see whole interface definition on [./types.d.ts](../types.d.ts).

