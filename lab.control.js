// Should run the reactions of each lab based on the resource name flags
// change the resources its lab assistants gather
// Add a function that takes a room + posx + posy + job type and returns how long it will take to deliver supplys from said room + location to the job room.

var labManager = function(roomName){
    
    var room = Game.rooms[roomName];
    
    
    this.labWorkers = Memory.population['labWorkers']['creeps']
    this.BasicComponents = ["O","H","U"]
    
    console.log(JSON.stringify(this.labWorkers))
    
}





module.exports = labManager