xuml
====

Draw basic UML

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
