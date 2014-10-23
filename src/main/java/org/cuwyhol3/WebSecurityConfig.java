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
						"/js-vendor/**", 
						"/home.html",
						"/patients.html"
						,"/patient.html"
						,"/protocols.html"
						,"/lp24h.html"
						,"/showimg.html"
						,"/saveNewPrescribe"
						,"/updatePrescribe"
						,"/updatePatient"
						,"/prescribe1sList"
						,"/save/prescribes"
						,"/session/copy"
						,"/session/paste"
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
