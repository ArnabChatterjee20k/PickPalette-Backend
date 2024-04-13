type STATUS = "SUCCESS" | "ERROR" | "NOT FOUND" 
export default (status: STATUS, code: number,data?:object|null|string|number) => ({
  status,
  code,
  ...(data && { data })
});
