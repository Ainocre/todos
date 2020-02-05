import { isNil, isString, isNumber, isArray, isBoolean } from 'lodash'
import emailRegex from 'email-regex'

export default {
    string: field => isNil(field) || isString(field),
    email: field => isNil(field) || isString(field) && emailRegex({exact: true}).test(field),
    number: field => isNil(field) || isNumber(field),
    boolean: field => isNil(field) || isBoolean(field),
    array: subFieldRule => field => isNil(field)
        || (isArray(field) && field.every(item => subFieldRule.type === 'StoreModel' ? subFieldRule.isInstanceOf(item) : subFieldRule(item))),
    date: field => true, // A faire
}
