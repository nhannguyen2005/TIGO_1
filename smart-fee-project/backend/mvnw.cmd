@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch Script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to enable the pausing after the execution of the beams
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM ----------------------------------------------------------------------------

@IF "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@setlocal

@set DIRNAME=%~dp0
@if "%DIRNAME%" == "" set DIRNAME=.\

@set APP_BASE_NAME=%~n0
@set APP_HOME=%DIRNAME%

@REM Resolve any "." and ".." in APP_HOME to make it shorter and clean
@for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@REM Find java.exe
@if not "%JAVA_HOME%" == "" goto xjavahome

@FOR %%X IN (java.exe) DO @SET FOURTH_ARG=%%~$PATH:X
@if not "%FOURTH_ARG%" == "" goto xdefaultjava

@echo.
@echo ERROR: JAVA_HOME not found in your environment.
@echo Please set the JAVA_HOME variable in your environment to match the
@echo location of your Java installation.
@echo.
@goto xerror

:xjavahome
@set JAVA_EXE="%JAVA_HOME%\bin\java.exe"
@if exist %JAVA_EXE% goto xinit

@echo.
@echo ERROR: JAVA_HOME is set to an invalid directory.
@echo JAVA_HOME = "%JAVA_HOME%"
@echo Please modify the variable facing to a correct directory.
@echo.
@goto xerror

:xdefaultjava
@set JAVA_EXE=java.exe
@goto xinit

:xinit
@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
@REM Fallback to current directory if not found.

@set BASE_DIR=%PROJECT_BASE_DIR%
@if not "%BASE_DIR%" == "" goto xgotbasedir

@set BASE_DIR=%APP_HOME%
:xloop
@if exist "%BASE_DIR%\.mvn" goto xgotbasedir
@set SAFE_DIR=%BASE_DIR%
@for %%i in ("%BASE_DIR%\..") do set BASE_DIR=%%~fi
@if "%SAFE_DIR%" == "%BASE_DIR%" (
  set BASE_DIR=%APP_HOME%
  goto xgotbasedir
)
@goto xloop

:xgotbasedir

@set WRAPPER_JAR="%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar"
@set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.1.0/maven-wrapper-3.1.0.jar"

@FOR %%X IN (curl.exe) DO @SET CURL_FOUND=%%~$PATH:X
@if not "%CURL_FOUND%" == "" goto xdownloadcurl

@FOR %%X IN (powershell.exe) DO @SET POWERSHELL_FOUND=%%~$PATH:X
@if not "%POWERSHELL_FOUND%" == "" goto xdownloadps

@echo.
@echo ERROR: Could not find curl or powershell, unable to download maven-wrapper.jar
@echo.
@goto xerror

:xdownloadcurl
@if exist %WRAPPER_JAR% goto xrun
@if not exist "%BASE_DIR%\.mvn\wrapper" mkdir "%BASE_DIR%\.mvn\wrapper"
@echo Downloading Maven Wrapper JAR...
@curl -sTh "" -o %WRAPPER_JAR% %DOWNLOAD_URL%
@goto xrun

:xdownloadps
@if exist %WRAPPER_JAR% goto xrun
@if not exist "%BASE_DIR%\.mvn\wrapper" mkdir "%BASE_DIR%\.mvn\wrapper"
@echo Downloading Maven Wrapper JAR via PowerShell...
@powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR%') }"
@goto xrun

:xrun
@REM Provide a "standard" JLI execution for this value
@set MAVEN_CMD_LINE_ARGS=%*

%JAVA_EXE% %MAVEN_OPTS% -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
@if %ERRORLEVEL% NEQ 0 goto xerror
@goto xend

:xerror
@exit /B 1

:xend
@endlocal
@if "%MAVEN_BATCH_PAUSE%" == "on" pause