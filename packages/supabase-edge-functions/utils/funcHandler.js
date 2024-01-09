export default async function funcHandler(fnc,...args){
    try{
        const data = await fnc(...args)
        return [data,null]
    }
    catch(error){
      return [null,error]
    }
}