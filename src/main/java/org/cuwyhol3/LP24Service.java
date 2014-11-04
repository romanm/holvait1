package org.cuwyhol3;

public class LP24Service {
	public static void main2(String[] args) {
		String arg1 = null;
		if(null == args){
			arg1 = "start";
		}else{
			arg1 = args[0];
		}
		if("start".equals(arg1)){
			start();
		}else
		if("stop".equals(arg1)){
			stop();
		}else{
			System.out.println("Use 'start' to start and 'stop' to stop.");
		}
	}

	private static void stop() {
		System.out.println("stop in development");
	}

	private static void start() {
		
		System.out.println("start in development");
		System.out.println("org.springframework.boot.loader.JarLauncher.main();");
	}
}
