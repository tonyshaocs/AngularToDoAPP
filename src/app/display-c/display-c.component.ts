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
  
  taskN:string=''; //The task's name
  taskD:string=''; //The task's description
  textA:string=''; //The text area that shows the JSON.
  
  constructor(public httpClient: HttpClient){
	    
  }

  
  ngOnInit() {
	  var isChrome = !!(<any>window).chrome && (!!(<any>window).chrome.webstore || !!(<any>window).chrome.runtime);
	  if (!isChrome){ //Warns user to use Chrome.
		  alert("Warning: Persistent FileSystem is not available on this browser, use Google Chrome instead for all features.");
	  }
	  
	  //Initially attempts to read the persistent storage for json.
	  this.httpClient.get( "filesystem:"+location.href+"persistent/tshaotodo.json").subscribe((res : any)=>{
			this.jsonArray = res.todo;
			for (var i=0;i<this.jsonArray.length;i++){
				this.model = new taskModel (this.jsonArray[i].task,this.jsonArray[i].complete,this.jsonArray[i].description);
				this.modelArray[i]=this.model;			
			}
			this.updateJSON();
      },
	  error => { //If file does not exist in persistent storage, reads the json file on local system, and creates the json file in the persistent storage.
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
		if(this.taskD!=""){ //If the user's inputted description is not empty
			this.modelArray.push({"task":this.taskN,"complete":false,"description":this.taskD}); 
		}
		else{ //If the user's inputted description is empty
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

  
  //Reads the file, once it is ready.
  afterRead(fileReadResult){
	   try{
		var jsObject = JSON.parse(fileReadResult);
		var c = this.modelArray.concat(jsObject['todo']);
		this.modelArray=c;
		//Calls Custom Filter 'MyFilterPipe' to remove duplicates.
		let filterPipe = new MyFilterPipe();
		this.modelArray=filterPipe.transform(this.modelArray,this.modelArray.length);
		this.updateJSON();
	   }
	   catch(exception){ //Handles in case of an incorrect json format.
		   alert("Incorrect format detected. The required format is JSON.");
	 }  
  }
  
  
  updateJSON(){ //Updates textarea on display and calls onFs to write to persistent storage.
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

  
  //Write to persistent storage on the browser. This is only available in Chrome.
  onFs(fs) {
	var jsonText=(<any>document).getElementById("showJSON").value;

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
	 
      var blob = new Blob([jsonText], {type: 'text/plain'}); // Create a new Blob on-the-fly.
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
