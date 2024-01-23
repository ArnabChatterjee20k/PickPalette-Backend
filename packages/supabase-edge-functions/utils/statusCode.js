export const statusCode = {
    SUCCESS : statusBuilder(200,"success",true),
    NOT_FOUND : statusBuilder(404,"not founc",false),
    EXISTS : statusBuilder(409,"already exists",false),
    ERROR : statusBuilder(500,"some error occured",false),
}

function statusBuilder(code,message,success){
    return {code,message,success}
}