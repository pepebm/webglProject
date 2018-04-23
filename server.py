#!/usr/bin/env python
from livereload import Server

server = Server()

server.watch('js/*')
server.watch('css/*')
server.watch('resources/*')
server.watch('index.html')

server.serve()
