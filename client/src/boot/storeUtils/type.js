import { date } from 'quasar'
import { isNil, isString, isNumber, isArray, isBoolean } from 'lodash'
import emailRegex from 'email-regex'

export default {
    string: field => isNil(field) || isString(field),
    email: field => isNil(field) || isString(field) && emailRegex({exact: true}).test(field),
    number: field => isNil(field) || isNumber(field),
    boolean: field => isNil(field) || isBoolean(field),
    array: subFieldRule => field => isNil(field)
        || (isArray(field) && field.every((item) =>  {
            if (subFieldRule.type === 'StoreModel') {
                if (subFieldRule.isInstanceOf(item)) {
                    return true
                } else {
                    const temp = new subFieldRule(item)
                    return true
                }
            } else {
                return subFieldRule(item)
            }
        })),
    date: field => isNil(field) || date.isValid(field),
}
