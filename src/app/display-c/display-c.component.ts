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

	constructor(public httpClient: HttpClient){}

    //On Init
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
			}
			catch(exception){
				alert("Failed to load default list values.");
			}
		}
		);
	}
  
  
	//User adds a new Task to the list
	addNewTask(){
		if(this.taskN!=""){
			if(this.taskD!=""){ //If the user's inputted description is not empty, all is well.
				this.modelArray.push({"task":this.taskN,"complete":false,"description":this.taskD}); 
			}
			else{ //If the user's inputted description is empty, include 'no description added' for the description.
				this.modelArray.push({"task":this.taskN,"complete":false,"description":this.taskD+"No Description Added"});
			}
		}
		else{
			alert("Task name cannot be empty");
		}

		//Calls the custom filter 'MyFilterPipe' to remove duplicates.
		let filterPipe = new MyFilterPipe();
		this.modelArray=filterPipe.transform(this.modelArray, this.modelArray.length);
		this.updateJSON();
	}
    
	
	//If user completes a Task, update the modelArray for that item, setting its complete property to true.
	completeTask(i){
		this.modelArray[i].complete=true;
		this.updateJSON();
	}
  
	//If user uncompletes a Task, update the modelArray for that item, setting its complete property to false.
	uncompleteTask(i){
		this.modelArray[i].complete=false;
		this.updateJSON();
	}
  
	//If user removes a Task, update the modelArray to remove that item.
	removeTask(i){
		this.modelArray.splice(i,1);
		this.updateJSON();
	}

	//When a file is dropped to the drop zone, pass it to the handler function: afterRead();
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
			//Calls the custom filter 'MyFilterPipe' to remove duplicates.
			let filterPipe = new MyFilterPipe();
			this.modelArray=filterPipe.transform(this.modelArray,this.modelArray.length);
			this.updateJSON();
		}
		catch(exception){ //Alert in case an incorrect JSON format is detected.
			alert("Incorrect format detected. The required format is JSON.");
		}  
	}
  
	//Updates the textarea and calls onFs() to write to persistent storage.
	updateJSON(){ 
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
				//Create a FileWriter object for the FileEntry.
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
