// Pipeline Jenkins equivalent au workflow GitHub Actions.
//
// Chaque etape s'execute dans un conteneur dedie : l'agent Jenkins n'a besoin
// ni de JDK, ni de Node, ni de Flutter installes. Seul Docker lui est requis.
pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        REGISTRY   = 'ghcr.io'
        IMAGE_BASE = 'zuzu2507/test-recrutement'
    }

    stages {
        stage('Verifications') {
            // Backend, frontend et mobile ne dependent pas les uns des autres :
            // les verifier en parallele raccourcit le retour d'information.
            parallel {
                stage('Backend') {
                    agent {
                        docker {
                            image 'maven:3.9-eclipse-temurin-21'
                            // Le cache Maven survit aux builds successifs.
                            args  '-v $HOME/.m2:/root/.m2'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('backend') {
                            // Les tests tournent sur H2 : aucune base externe.
                            sh 'mvn -B verify'
                        }
                    }
                    post {
                        always {
                            junit testResults: 'backend/target/surefire-reports/*.xml',
                                  allowEmptyResults: true
                        }
                    }
                }

                stage('Frontend') {
                    agent {
                        docker {
                            image 'node:22-alpine'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run lint'
                            sh 'npm run build'
                        }
                    }
                }

                stage('Mobile') {
                    agent {
                        docker {
                            image 'ghcr.io/cirruslabs/flutter:stable'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('mobile') {
                            sh 'flutter pub get'
                            sh 'flutter analyze'
                            sh 'flutter test'
                        }
                    }
                }
            }
        }

        stage('Images Docker') {
            // Rien n'est construit si une verification a echoue.
            steps {
                script {
                    def tag = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'local'
                    ['backend', 'frontend'].each { module ->
                        sh "docker build -t ${IMAGE_BASE}/${module}:${tag} ./${module}"
                    }
                }
            }
        }

        stage('Publication') {
            // Seule la branche principale publie ses images.
            when { branch 'main' }
            steps {
                script {
                    def tag = env.GIT_COMMIT.take(7)
                    withCredentials([usernamePassword(
                            credentialsId: 'ghcr-credentials',
                            usernameVariable: 'REGISTRY_USER',
                            passwordVariable: 'REGISTRY_TOKEN')]) {
                        sh 'echo "$REGISTRY_TOKEN" | docker login $REGISTRY -u "$REGISTRY_USER" --password-stdin'
                        ['backend', 'frontend'].each { module ->
                            sh "docker tag ${IMAGE_BASE}/${module}:${tag} ${REGISTRY}/${IMAGE_BASE}/${module}:${tag}"
                            sh "docker push ${REGISTRY}/${IMAGE_BASE}/${module}:${tag}"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout $REGISTRY || true'
            cleanWs()
        }
    }
}
