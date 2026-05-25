# My Favorite Places app

This is a demo app to work arround Docker and CI, you should clone this repo, remove the `.git` folder and push it to your own public repo!

The client folder is empty, you may create an interface to communicate with the server! This is kind of a bonus

PDF 1 : 

Exercice 1 : 

docker compose up 

Le container de la base de données (db-1) et le serveur (server-1) démarrent en même temps. Le serveur tente immédiatement de se connecter à PostgreSQL, mais comme la base de données est encore en phase d'initialisation, la connexion est refusée (ECONNREFUSED), provoquant l'arrêt du processus du serveur.

#5 
BDD <--> Serveur : Ils communiquent à travers le réseau virtuel créé par Docker Compose. Le serveur utilise le nom de service défini dans le fichier YAML pour cibler l'adresse IP interne de la base de données sur le port 5432.  

Serveur <--> Front : L'application React (générée avec Vite) est compilée et servie au navigateur. C'est le navigateur de l'utilisateur (côté client) qui exécute le code JavaScript et effectue des requêtes HTTP directes vers l'API exposée sur la machine hôte.  

Pour aller plus loin : 

Mécanisme mis en place : Utilisation combinée de la clause healthcheck sur le service db (qui exécute la commande native pg_isready toutes les 5 secondes) et de la clause depends_on avec la condition service_healthy sur le service server. Le serveur attend ainsi que la base soit totalement opérationnelle avant de lancer son propre processus, éliminant les crashs de connexion au démarrage.  

Mécanisme mis en place : Ajout de la directive restart: unless-stopped sur l'ensemble des services (db, server, client). Cela garantit la haute disponibilité locale de notre application en cas de crash interne imprévu d'un processus. 


Exeercice 2 : 

cd server && yarn test

Résultat obtenu : Test Suites: 1 passed, 1 total. La fonction getDistance valide correctement l'assertion d'égalité de coordonnées géographiques.

Fichier de configuration du Workflow créé : .github/workflows/ci.yml


Exercice 3 : 

Différences fondamentales entre Dev et Prod : 
1. Suppression des clauses build: : En production, l'infrastructure s'appuie exclusivement sur des images Docker immuables préalablement construites (image: mfp-server:latest et image: mfp-client:latest). Cela accélère le déploiement et garantit que le code exécuté est strictement identique à celui validé par la CI.

2.Suppression des volumes de synchronisation de code : Les montages de dossiers locaux (./server:/app) ont été retirés. Les fichiers de l'application sont directement encapsulés à l'intérieur de l'image, empêchant toute dérive ou altération accidentelle du code en production.

docker compose -f compose.prod.yml up


PDF 2 : 

Exercice 1 : 

L'approche DinD (Docker-in-Docker) : Consiste à faire tourner un démon Docker complet et isolé à l'intérieur d'un conteneur Docker. Le conteneur enfant possède son propre système de fichiers pour ses images et ses conteneurs. Elle nécessite obligatoirement l'argument --privileged.

L'approche DooD (Docker-out-of-Docker) : Consiste à monter le socket Docker de la machine hôte (-v /var/run/docker.sock:/var/run/docker.sock) à l'intérieur d'un conteneur. Le conteneur ne lance pas son propre Docker, il passe des ordres au Docker de ta machine. Les conteneurs créés tournent "à côté" du conteneur et non "dedans".

Réflexion pour tester Docker Swarm : Pour simuler un cluster Swarm (plusieurs machines indépendantes), l'approche DooD est inutilisable car tous les nœuds partageraient le même Docker hôte. L'approche DinD est idéale : elle permet de créer 4 conteneurs isolés possédant chacun leur propre moteur Docker indépendant et étanche, recréant fidèlement le comportement de 4 serveurs distincts connectés en réseau.

Exercice 2 : 

# 1. Initialisation du Swarm sur le nœud maître
docker exec -it mfp-swarm-cluster-manager-1 ash
docker swarm init

# 2. Raccordement des nœuds Workers via le réseau interne Compose
docker exec -it mfp-swarm-cluster-node1-1 ash
docker swarm join --token [TOKEN_FOURNI] manager:2377

Résultat de validation (docker node ls) :
L'exécution de la commande de contrôle sur le manager confirme que les 4 nœuds ont le statut Ready et Active. L'instance manager est explicitement désignée sous le statut réglementaire de Leader.

Exercice 3 : 

docker service create --name web-service --publish 8080:80 --replicas 3 nginx:alpine

Analyse et observations (docker service ps web-service) :
L'orchestrateur a automatiquement intercepté l'ordre de déploiement et téléchargé l'image légère nginx:alpine. Les 3 instances (réplicas) demandées ont été réparties de manière équitable et transparente sur 3 nœuds distincts du cluster (par exemple, le manager, le node2 et le node3).

Avantage de production : Cette configuration garantit une haute disponibilité. Si l'un des nœuds Workers subit une panne, le Manager détecte la rupture de l'état recherché (Desired State) et replanifie instantanément le réplica manquant sur un autre nœud actif sans coupure de service pour l'utilisateur.

Exercice 4 : 

Conception d'un inventaire Ansible ciblant l'API Docker locale et d'un playbook automatisé (swarm-playbook.yml)

Fonctionnement du Playbook :
    - Il cible en premier lieu le groupe [managers] pour exécuter le module community.docker.docker_swarm au statut present.

    - Il extrait dynamiquement le jeton de sécurité (join_token) généré en tâche de fond par le moteur Docker et le mémorise dans une variable globale.

    - Il bascule sur le groupe [workers] pour forcer la jonction (state: join) en poussant automatiquement le token requis vers l'hôte logique manager:2377.

Le script respecte scrupuleusement le principe d'idempotence propre à Ansible. S'il est exécuté plusieurs fois d'affilée, il analyse l'état du cluster : si les nœuds sont déjà raccordés, il passe les étapes (Ok / Skipped) sans provoquer de plantage ni altérer l'infrastructure en production.

