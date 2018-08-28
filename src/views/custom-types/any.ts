import { GraphQLScalarType, Kind } from "graphql";

function safeJSONParse(text){
    try{
        return JSON.parse(text)
    }catch(e){
        return null
    }
}

function parseAnyTypeLiteral(ast){
    switch (ast.kind) {
        case Kind.OBJECT: {
            return ast.fields.reduce((values,field)=>{
                values[field.name.value] = parseAnyTypeLiteral(field.value)
                return values
            },{})
        }
        case Kind.LIST:
            return ast.values.map(x=>{
                return parseAnyTypeLiteral(x)
            })
        case Kind.ENUM:
        case Kind.FLOAT:
        case Kind.STRING:
        case Kind.INT:
        case Kind.BOOLEAN:
            return ast.value
        case Kind.NULL:
        default: 
            return null
    }
  }

export const GraphQLAnyType = new GraphQLScalarType({
  name: 'Any',
  description: 'Arbitrary object',
  parseValue: (value) => {
    return typeof value === 'object' ? value
      : typeof value === 'string' ? safeJSONParse(value)
      : null
  },
  serialize: (value) => {
    return typeof value === 'object' ? value
      : typeof value === 'string' ? safeJSONParse(value)
      : null
  },
  parseLiteral:parseAnyTypeLiteral
})