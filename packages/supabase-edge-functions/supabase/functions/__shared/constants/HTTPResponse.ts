type STATUS = "SUCCESS" | "ERROR" | "NOT FOUND" 
export default (status: STATUS, code: number,data?:object|null) => ({
  status,
  code,
  ...(data && { data })
});
