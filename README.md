#Glue

Glues your css @imports together into a single file.

##Installation
	npm install -g Glue
	
##Usage

* -h, --help         Output usage information
* -V, --version      Output the version number
* -a, --all          Creates, glues, minifies and watches a new glue structure in the current directory
* -n, --new          Create a glue structure on the current directory
* -p, --path <path>  Glues the main.css on the src folder of the specified path
* -w, --watch        Watches for changes and glues automagically
* -m, --mini         Minifies the glued css

##Examples
Glues the imports on the main.css file (src/main.css)
	
	glue
	
Glues and minify the imports on the main.css file (src/main.css)

	glue -m	

Create a new folder structure on the current directory
	
	glue -n
	
Create a new folder structure on the path specified
	
	glue -n	-p <path>

Watch for changes on imported files and glue atomatically

	glue -w
	
Watch for changes on imported files and minify

	glue -w	-m

Create a new folder structure in /css, watch and minify when changing an imported file.

	glue -a -p css
	

