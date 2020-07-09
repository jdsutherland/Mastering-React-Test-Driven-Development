export const required = description => value =>
  !value || value.trim() === '' ? description : undefined

export const match = (re, description) => value =>
  !value.match(re) || value.trim() === '' ? description : undefined

export const list = (...validators) => value =>
  validators.reduce((result, validator) =>
    result || validator(value),
    undefined)
