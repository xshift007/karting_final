pipeline {
    agent any

    tools {
        maven 'maven'
    }

    environment {
        // Forzar Docker CLI a usar el contexto 'default'
        DOCKER_CONTEXT = 'default'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    doGenerateSubmoduleConfigurations: false,
                    userRemoteConfigs: [[
                        url: 'https://github.com/xshift007/karting.git',
                        credentialsId: 'git-credentials'
                    ]]
                ])
            }
        }

        stage('Build JAR File') {
            steps {
                dir('kartingrm') {
                    bat 'mvn clean install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('kartingrm') {
                    bat 'mvn test'
                }
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                dir('kartingrm') {
                    bat 'docker context use default || true'
                    script {
                        docker.withRegistry('https://index.docker.io/v1/', 'docker-credentials') {
                            // construyo con el número de build...
                            def img = docker.build("xsh1ft/kartingrm:${env.BUILD_NUMBER}")
                            img.push()           // → xsh1ft/kartingrm:<BUILD_NUMBER>
                            img.push('latest')   // → xsh1ft/kartingrm:latest
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
