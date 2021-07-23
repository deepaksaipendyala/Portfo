# Portfo
## So how do websites work? 
Here I'm going to focus on the python side of things. But I do want to help you understand what we're building and how everything works, because hopefully you're able to actually change your portfolio to your own liking and showcase yourself So I have a website for you here, we have www.google.com, If I click refresh here or enter this URL, I'm taken to this website, but  
### How does this actually work? 
How is my browser, ex. Google Chrome, able to display this Web page for me? I need to be connected to the Internet. So, there's some sort of data that's being transferred for me to be able to see this. So, let's explore how this works. 

![How websites work](/readme%20media/1.png)


In this diagram, I'm going to attempt to just tell you exactly how it works. It's quite simple. We have our browser right here, which can be Google Chrome, SAFARI, Firefox. It doesn't matter. This browser, we're able to type into it a website or maybe Google for a website and then click on  a website when we click on a website. What happens is that through Internet, the browser makes a request all the way to another machine. And this machine, which we call a server, is located anywhere in the world. It doesn't really matter because through our Internet network, the browser is going to say, hey, this website, who owns that website or which machine can serve me the files for that website? And using some complex logic, it's going to find this server, which at the end of the day is just a computer, we're actually going to see how to deploy our own server. 
Well, it simply says, hey, give me some data, because without data, I'm not able to display anything  on a webpage.HTML<CSS<JS is that data btw And the server, well, first of all, they communicate over something called HTTP? HTTPS because the browser and the server are two different machines, right? HTTP/HTTPS which is a secured encrypted version of communication, allows me to access data belonging to a website 
So, the request has just been made, this server just happens to have three files that we need. 
### One is an HTML file:  this file is the text or content of the website. 
### The other one is the CSS file: this contains all the styling of the website.so that is colors, maybe some fonts, maybe the position of the elements, anything to do with style. So, it doesn't look like a boring piece of text. 
### And then we have JavaScript. :  
JavaScript is what gives websites behavior. When I log into Facebook or maybe tweet something on Twitter, JavaScript is allowed me to perform those actions because with just a HTML and CSS, we just have text and some pretty styling. With JavaScript, we're able to take actions, but we don't need to focus on that too much.  
### Do you think that this server has to be written in Python? 
What do you think? No, it doesn't. The browser doesn't care what this machine is like. All it  cares about are these three files. And because we're speaking in this HTTP/S protocol. The browser says, hey, I don't care what language you speak, I don't care anything, I'm just going to tell you through this. Just give me the data that I want and we can do whatever logic we want in here. I can send emails from here if I want. I can send text messages. I can do math operations. I can play a game on this computer if I want. 
It doesn't really matter as long as I am able to send these files back to the browser. 

 ### So, we can do that with Python, 
 but we can do that with other languages like PHP,Java, we can write a server in any type of language. 
 
 ## Youtube Video on How this works will be updated soon here! Meanwhile check out my other projects
 
## Website hosted with python flask as Backend server
https://deepaksai.pythonanywhere.com

### I successfully worked on backend with Python flask and now i'm working on frontend with very basic HTML,CSS,JS. afc, using templates!

To run Python on local host, Do follow the instructions:

