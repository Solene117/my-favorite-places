# My Favorite Places app

This is a demo app to work arround Docker and CI, you should clone this repo, remove the `.git` folder and push it to your own public repo!

The client folder is empty, you may create an interface to communicate with the server! This is kind of a bonus


Exercice 1 : 

docker compose up 

Le container de la base de données (db-1) et le serveur (server-1) démarrent en même temps. Le serveur tente immédiatement de se connecter à PostgreSQL, mais comme la base de données est encore en phase d'initialisation, la connexion est refusée (ECONNREFUSED), provoquant l'arrêt du processus du serveur.

#5 
BDD <--> Serveur : Ils communiquent à travers le réseau virtuel créé par Docker Compose. Le serveur utilise le nom de service défini dans le fichier YAML pour cibler l'adresse IP interne de la base de données sur le port 5432.  

Serveur <--> Front : L'application React (générée avec Vite) est compilée et servie au navigateur. C'est le navigateur de l'utilisateur (côté client) qui exécute le code JavaScript et effectue des requêtes HTTP directes vers l'API exposée sur la machine hôte.  

Pour aller plus loin : 

Mécanisme mis en place : Utilisation combinée de la clause healthcheck sur le service db (qui exécute la commande native pg_isready toutes les 5 secondes) et de la clause depends_on avec la condition service_healthy sur le service server. Le serveur attend ainsi que la base soit totalement opérationnelle avant de lancer son propre processus, éliminant les crashs de connexion au démarrage.  

Mécanisme mis en place : Ajout de la directive restart: unless-stopped sur l'ensemble des services (db, server, client). Cela garantit la haute disponibilité locale de notre application en cas de crash interne imprévu d'un processus. 

