package org.cuwyhol3;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.servlet.configuration.EnableWebMvcSecurity;

@Configuration
@EnableWebMvcSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.csrf().disable()
			.authorizeRequests()
				.antMatchers(
						"/", 
						"/i*", 
						"/form*", 
						"/print*", 
						"/read/**", 
						"/img/**", 
						"/img/7/**", 
						"/css/**", 
						"/fonts/**",
						"/css-vendor/**", 
						"/db/**", 
						"/db/prescribe/**", 
						"/js/**", 
						"/js-vendor/**" 
						,"/tmp/dp*" 
						,"/home.html"
						,"/elexRean.html"
						,"/elexReanPrecis.html"
						,"/elexReanStat.html"
						,"/help.html"
						,"/conf.html"
						,"/showimg.html"
						//drug
						,"/drugs.html"
						,"/drug.html"
						,"/saveNewDrug"
						,"/removeDrug"
						,"/updateDrug"
						,"/drug1sList"
						,"/save/drug"
						//prescribe
						,"/prescribes24h.html"
						,"/lp24h.html"
						,"/protocols.html"
						,"/saveNewPrescribe"
						,"/updatePrescribe"
						,"/prescribe1sList"
						,"/save/prescribes"
						,"/save/sah/prescribes"
						//patient
						,"/patient*"
//						,"/patients.html"
//						,"/patient1sList"
						,"/saveNewPatient"
						,"/autosave/patient"
						,"/save/patient"
						,"/removePatient"
						,"/updatePatient"
						//edit
						,"/session/copy"
						,"/session/paste"
						//elex
						,"/elexRea"
						).permitAll()
				.anyRequest().authenticated();
		http
			.formLogin()
				.loginPage("/login")
				.permitAll()
				.and()
			.logout()
				.permitAll();
	}
	@Configuration
	protected static class AuthenticationConfiguration extends
		GlobalAuthenticationConfigurerAdapter {
		@Override
		public void init(AuthenticationManagerBuilder auth) throws Exception {
			auth
				.inMemoryAuthentication()
					.withUser("user").password("password").roles("USER");
		}
	}

}
