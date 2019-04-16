import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'MyFilterPipe',
	 pure: false
})

export class MyFilterPipe implements PipeTransform {
	transform (val?:any, len?:number):any{
		var count=0, warningProc=0;
		var curName;
		for (var i =0; i<len;i++){
			curName=val[i].task;
			for (var a=0; a<len;a++){
				if(curName.toUpperCase()===val[a].task.toUpperCase()){
					count=count+1;
					if (count>1){
						val.splice(a,1);
						warningProc=warningProc+1;
						len=len-1;
					}
				}
			}
			count=0;
		}
		if (warningProc==1){
			alert("Duplicate Task was detected. It was removed automatically. \nReason: Duplicate Tasks are not permitted.");
		}
		else if (warningProc>1){
			alert("Duplicate Tasks were detected. They were removed automatically. \nReason: Duplicate Tasks are not permitted.");
		}
		
		return val;
	}
}