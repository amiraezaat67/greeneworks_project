

const reqMethods = ['body', 'query', 'params', 'headers', 'file', 'files']

export const validationCoreFunction = (schema) => {
    return (req, res, next) => {
      let validationErrorArr = []
      for (const key of reqMethods) {
        if (schema[key]) {
          const validationResult = schema[key].validate(req[key], {
            abortEarly: false,
          }) 
          if (validationResult.error) {
            console.log(validationResult.error)
            validationErrorArr.push(validationResult.error.details)
          }
        }
      }
  
      if (validationErrorArr.length) {
        req.validationErrors = validationErrorArr
        return next(new Error('', { cause: 400 }))
      }
      next()
    }
  }