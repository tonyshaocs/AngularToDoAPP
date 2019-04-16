import { Component, OnInit, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyFilterPipe} from '../pipes/my-filter';
import {taskModel} from './model';

@Component({
  selector: 'app-display-c',
  templateUrl: './display-c.component.html',
  styleUrls: ['./display-c.component.css']
})
export class DisplayCComponent implements OnInit {
  public jsonArray  = [];  
  public dragdropArray  = [];
  //Custom Model
  public model: taskModel;
  public modelArray=[];
  
  taskN:string='';
  taskD:string='';
  textA:string='';
  
  constructor(public httpClient: HttpClient){
	    
  }

  
  ngOnInit() {
	  var isChrome = !!(<any>window).chrome && (!!(<any>window).chrome.webstore || !!(<any>window).chrome.runtime);
	  if (!isChrome){
		  alert("Warning: FileSystem is not available on this browser, use Google Chrome instead for all features.");
	  }
	  
	  //Tries to read the persistent storage for json.
	  this.httpClient.get( "filesystem:"+location.href+"persistent/tshaotodo.json").subscribe((res : any)=>{
			this.jsonArray = res.todo;
			for (var i=0;i<this.jsonArray.length;i++){
				this.model = new taskModel (this.jsonArray[i].task,this.jsonArray[i].complete,this.jsonArray[i].description);
				this.modelArray[i]=this.model;			
			}
			this.updateJSON();
      },
	  error => { //If it does not exist, reads the json file on server and then creates the json file in the persistent storage to be updated.
		try{
		this.httpClient.get(location.href+"assets/todo.json").subscribe((res : any)=>{
			this.jsonArray = res.todo;
			for (var i=0;i<this.jsonArray.length;i++){
				this.model = new taskModel (this.jsonArray[i].task,this.jsonArray[i].complete,this.jsonArray[i].description);
				this.modelArray[i]=this.model;
			}
			this.updateJSON();
		});
		}catch(exception){
			alert("Failed to load default list values.");
		}
      }  
	  );
  }
  
  
  //User Adds Task
  addNewTask(){
	  if(this.taskN!=""){
		if(this.taskD!=""){
			this.modelArray.push({"task":this.taskN,"complete":false,"description":this.taskD});
		}
		else{
			this.modelArray.push({"task":this.taskN,"complete":false,"description":this.taskD+"No Description Added"});
		}
	  }
	  else{
		alert("Task name cannot be empty");
	  }
	  
	  let filterPipe = new MyFilterPipe();
	  this.modelArray=filterPipe.transform(this.modelArray,this.modelArray.length);
	  this.updateJSON();
  }
    
	
  //User completes Task
  completeTask(i){
	  this.modelArray[i].complete=true;
	  this.updateJSON();
  }
  
  //User uncompletes Task
  uncompleteTask(i){
	  this.modelArray[i].complete=false;
	  this.updateJSON();
  }
  
  
  //User removes Task
  removeTask(i){
	  this.modelArray.splice(i,1);
	  this.updateJSON();
  }

  
  onDrop(event) {
      event.preventDefault();
	  var files = event.dataTransfer.files; 
	  var reader = new FileReader();  
	  var file=files[0];
	  reader.onload=(result:any)=>{
		this.afterRead(reader.result);  
	  }
	  reader.readAsText(file);
  }

  
  //readFile, once it is ready.
  afterRead(lol){
	   try{
		var jsObject = JSON.parse(lol);
		var c = this.modelArray.concat(jsObject['todo']);
		this.modelArray=c;
		//Calling Custom Filter 'MyFilterPipe'
		let filterPipe = new MyFilterPipe();
		this.modelArray=filterPipe.transform(this.modelArray,this.modelArray.length);
		this.updateJSON();
	   }
	   catch(exception){ //in case of wrong json
		   try{
			   var removeStuff = lol.split("\n");
			   for (var i=0; i<removeStuff.length;i++){
				   removeStuff[i]=removeStuff[i].replace("todo","\"todo\":");
				   removeStuff[i]=removeStuff[i].replace("task","\"task\"");
				   removeStuff[i]=removeStuff[i].replace("complete","\"complete\"");
				   removeStuff[i]=removeStuff[i].replace("description","\"description\"");
				   while (removeStuff[i].includes("'")&&removeStuff[i].includes("task")){
					   removeStuff[i]=removeStuff[i].replace("'","\"");
				   }
				}
				var str="";
			    for (var i =0; i<removeStuff.length;i++){
					str=str+removeStuff[i];
				}
				console.log(str);
				var jsObject = JSON.parse(str);
				var c = this.modelArray.concat(jsObject['todo']);
				this.modelArray=c;
				let filterPipe = new MyFilterPipe();
				this.modelArray=filterPipe.transform(this.modelArray,this.modelArray.length);
				this.updateJSON();
		   }catch(exception){ //failure
				alert("Incorrect JSON format");   
		   }
	 }  
  }
  
  
  updateJSON(){ //Updates textarea + the json file.
	  this.textA="{\n\"todo\":"+JSON.stringify(this.modelArray,null,"\t")+"\n}";
	  try{
		(<any>window).webkitStorageInfo.requestQuota((<any>window).PERSISTENT, 1024*1024);
		(<any>window).webkitRequestFileSystem((<any>window).PERSISTENT, 1024*1024, this.onFs, this.onError);
	  }
	  catch{ 
		  console.log("FileSystem not available on this browser, use Google Chrome");  
	  }
  }
  
  
  onDragOver(event) {
      event.stopPropagation();
      event.preventDefault();
  }

  
  //Write to persistent storage
  onFs(fs) {
	var idk=(<any>document).getElementById("qq").value;

	try{
	fs.root.getFile('./tshaotodo.json', {create: true}, function(fileEntry) {
	// Create a FileWriter object for our FileEntry.
    fileEntry.createWriter(function(fileWriter) {
	
      var truncated = false;
	  fileWriter.onwriteend = function(e) {
        if (!truncated) {
            truncated = true;
            this.truncate(this.position);
            return;
        }
        console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
	  };
	 
      var blob = new Blob([idk], {type: 'text/plain'}); // Create a new Blob on-the-fly.
      fileWriter.write(blob);
	
    });
  });
	}
	catch(e){
		alert("Failed to write to File");
	}
	}

	
  onError(e){
	console.log(e.name);
  }
  
}
