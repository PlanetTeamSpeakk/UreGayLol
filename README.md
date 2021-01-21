# Ure gay lol
A joke website to tell someone they're gay.  
https://uregay.lol

## Query parameters
There are a couple query parameters you can pass, here's a list of them:
  + `intensity` the intensity of the movements of the flag.
    - Type: `float`
    - Default: `1`
    - Example: https://uregay.lol/?intensity=2
  + `flag` the flag to render in the background.
    - Type: `string`
    - Default: `'gay'`
    - Values: `gay`, `lesbian`, `bi`, `trans`, `straight`
    - Example: https://uregay.lol/?flag=lesbian
  + `colour` a colour of a row in the flag, overrides `flag` parameter if passed. Can be passed multiple times for multiple rows.
    - Type: `string`
    - Default: `null`
    - Values: any hex colour or [named HTML colour](https://www.w3schools.com/colors/colors_names.asp).
    - Example: https://uregay.lol/?colour=red&colour=#FFFFFF&colour=blue
  + `name` the name of whoever called the viewer gay.
    - Type: `string`
    - Default: `'Someone out there'`
    - Example: https://uregay.lol/?name=PlanetTeamSpeak
  + `text` the text to display instead of the default `'gay'`.
    - Type: `string`
    - Default: the name of the `flag` parameter
    - Example: https://uregay.lol/?text=dutch
