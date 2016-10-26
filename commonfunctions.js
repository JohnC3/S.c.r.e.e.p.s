        
var common = {
    // Code for moving onto station that actually works!
    moveToStation:function(creep){
        if(creep.room.name != creep.memory.current_room){
            if(creep.pos.x == 0){
                creep.move(RIGHT)
            }
            if(creep.pos.x == 49){
                creep.move(LEFT)
            }
            if(creep.pos.y == 0){
                creep.move(BOTTOM_RIGHT)
            }
            if(creep.pos.y == 49){
                creep.say(creep.move(TOP_RIGHT))
            }
            creep.memory.current_room = creep.room.name
            creep.say('newRoom')
        }
        

        
        
        
        if(creep.room.name != creep.memory.station){
            if(creep.memory.station_path){
                var M = creep.moveByPath(Room.deserializePath(creep.memory.station_path))
                if(M < 0){// && M != -5){
                    creep.memory.station_path = undefined;
                }
                creep.say('move'+ M)
            }
            else{
                var to = new RoomPosition(25,25,creep.memory.station)
                if(to == undefined){
                    var out = creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
                    
                    creep.say('No vision')
                    creep.say('On move')
                    if(out == -2){
                        if(creep.pos.x == 0){
                            creep.move(RIGHT)
                        }
                        if(creep.pos.x == 49){
                            creep.move(LEFT)
                        }
                        if(creep.pos.y == 0){
                            creep.move(BOTTOM)
                        }
                        if(creep.pos.y == 49){
                            creep.move(TOP)
                        }
                    }
                }
                else{
                    creep.memory.station_path = Room.serializePath(creep.room.findPath(creep.pos,to,ignore = [Game.rooms["W51S36"]]))
                    
                }
            }
            
        } 
    }
}

module.exports = common