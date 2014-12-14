xuml
====

Draw basic UML

See the [video](https://www.youtube.com/watch?v=jhG78R7BEa0&feature=youtu.be):

[![See the video](https://i.ytimg.com/vi/jhG78R7BEa0/hqdefault.jpg)](https://www.youtube.com/watch?v=jhG78R7BEa0&feature=youtu.be)

```
C Challenge
a name : String
a desc : String (Textarea)
a idReward [1..1] C Reward
a rules : Array [1..*] C Rule
a live : Boolean (Toggle)
a created : Date (ignore)
m getNotif
m setNotif

C Reward
a name : String
a type : Enum('a','b','c')

C Rule
a name : String
a times : String
a condition : String

```
