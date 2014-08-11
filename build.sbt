import play.Project._

name := "esb-console-play2"

version := "1.0"

playJavaSettings

libraryDependencies += "commons-io" % "commons-io" % "2.4"

libraryDependencies += "org.apache.activemq" % "activemq-all" % "5.9.0"

libraryDependencies += "org.eclipse.jetty.websocket" % "websocket-client" % "9.2.1.v20140609"

libraryDependencies += "org.mongodb" % "mongo-java-driver" % "2.12.3"

playAssetsDirectories <+= baseDirectory / "websrc"
