import play.Project._

name := "esb-console-play2"

version := "1.0"

playJavaSettings

libraryDependencies += "commons-io" % "commons-io" % "2.4"

libraryDependencies += "org.apache.activemq" % "activemq-all" % "5.9.0"

playAssetsDirectories <+= baseDirectory / "websrc"