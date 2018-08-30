import { GraphQLScalarType, Kind } from "graphql";

function safeJSONParse(text){
    try{
        return JSON.parse(text)
    }catch(e){
        return null
    }
}



export const GraphQLAny = new GraphQLScalarType({
  name: 'Any',
  description: 'Arbitrary type',
  parseValue: (value) => {
    return value
  },
  serialize: (value) => {
    return value
  },
  parseLiteral:function parseAnyTypeLiteral(ast,variables){
    switch (ast.kind) {
        case Kind.OBJECT: {
            return ast.fields.reduce((values,field)=>{
                values[field.name.value] = parseAnyTypeLiteral(field.value,variables)
                return values
            },{})
        }
        case Kind.LIST:
            return ast.values.map(x=>{
                return parseAnyTypeLiteral(x,variables)
            })
        case Kind.VARIABLE:
            return variables ? variables[ast.name.value]:null
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
})