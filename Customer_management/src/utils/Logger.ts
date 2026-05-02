const Logger = {
    info:(message:string, data?:any) =>{
        console.log(`[INFO] ${message}`, data || '');
    },
    error:(message:string, data?:any) =>{
        console.log(`[ERROR] ${message}`, data || '');
    }
};

export default Logger;