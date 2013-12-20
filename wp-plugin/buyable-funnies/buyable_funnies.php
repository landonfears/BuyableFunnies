<?php
/*
Plugin Name: Buyable Funnies
Plugin URI: http://buyablefunnies.com
Description: This plugin inserts your Buyable Funnies content onto your website. Visit <a href="options-general.php?page=buyable_funnies">the settings page</a> to enter your User Key and to get directions to inserting your content.
Version: 1.0
Author: Landon Fears
Author URI: http://buyablefunnies.com
License: GPLv2 or later
*/
/*  Copyright 2009-2011  Landon Fears  (email : buyablefunnies@gmail.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

add_option( 'buyablefunnies_key' );

add_action( 'admin_menu', 'buyablefunnies_admin_menu');
add_action( 'wp_enqueue_scripts', 'buyablefunnies_load_script' ); 
add_action( 'widgets_init', 'buyablefunnies_load_widget' );

/**
 * add MENU
 */
function buyablefunnies_admin_menu() {
  add_options_page('Buyable Funnies', 'Buyable Funnies', 8, 'buyable_funnies', 'buyablefunnies_admin_options');
}

/**
 * OPTIONS page
 */
function buyablefunnies_admin_options() {

	echo '<div class="wrap">';
	echo '<h2>Buyable Funnies</h2>';
	
	if ( $_POST['_wpnonce'] ) {
		update_option( 'buyablefunnies_key', htmlspecialchars( $_POST['buyablefunnies_key'] ) );
		echo '<div id="message" class="updated"><p>User Key updated.</p></div>';
	}

	echo '
		<form name="form1" method="post" action="'.str_replace( '%7E', '~', $_SERVER['REQUEST_URI']).'">
			'.wp_nonce_field('update-options').'
			<p>Enter your Buyable Funnies User Key below.</p>
			<p>This will appear in your User Area when you get the code for the Free Widget. If you are not a <a href="http://buyablefunnies.com/join" target="_blank">Buyable Funnies Member</a> you will not have a User Key.</p>
			<table class="form-table">
				<tr valign="top">
					<th scope="row">User Key</th>
					<td><input type="text" name="buyablefunnies_key" value="'.get_option('buyablefunnies_key').'" size="50" /></td>
				</tr>
			</table>
			<p class="submit">
			<input class="button-primary" type="submit" name="Submit" value="Update User Key" />
			</p>
			<h3>Free Widget</h3>
			<p> To add the free widget to a page, use either use Wordpress Widgets "Buyable Funnies Widget" or the shortcode [buyable_funnies_widget align="xxx"], where align has a value of "left", "right", "center", or left blank.</p>
		</form>
	</div>';
}

function buyablefunnies_load_script() {
 	// Only load the script if a User Key has been input in the Settings
	$key = get_option('buyablefunnies_key');
	wp_register_script('buyable-funnies-embed', 'http://d30exyil9uoqwq.cloudfront.net/buyable_funnies_embed.js?key='.$key, array('jquery'), '1.0', true);
  	wp_enqueue_script( 'buyable-funnies-embed' );
}

// Creating the widget 
class buyablefunnies_widget extends WP_Widget {
	function __construct() {
		parent::__construct(
			// Base ID of your widget
			'buyablefunnies_widget', 
			// Widget name will appear in UI
			__('Buyable Funnies Widget', 'buyablefunnies_widget_domain'), 
			// Widget description
			array( 'description' => __( 'Inserts Buyable Funnies Free Widget', 'buyablefunnies_widget_domain' ) ) 
		);
	}

	// Creating widget front-end
	// This is where the action happens
	public function widget( $args, $instance ) {
		$aligno = $instance['align'];
		if($aligno == 'left') $align = 'style="float:left !important"';
		if($aligno == 'right') $align = 'style="float:right !important"';
		if($aligno == 'center') $align = 'style="margin:0 auto !important"';
			
		// This is where you run the code and display the output
		echo __( '<div class="buyablefunnies_embed buyablefunnies_widget" '.$align.'></div>', 'buyablefunnies_widget_domain' );
	}
		
	// Widget Backend 
	public function form( $instance ) {
		
		if ( isset( $instance[ 'align' ] ) ) {
			$align = $instance[ 'align' ];
		}
		else {
			$align = __( '', 'buyablefunnies_widget_domain' );
		}
		// Widget admin form
		$aval = esc_attr( $align );
		$anone = ($aval == 'none') ? 'selected="selected"' : '';
		$aleft = ($aval == 'left') ? 'selected="selected"' : '';
		$aright = ($aval == 'right') ? 'selected="selected"' : '';
		$acenter = ($aval == 'center') ? 'selected="selected"' : '';
		echo '<p>
			<label for="'.($this->get_field_id( 'align' )).'">Align:</label> 
			<select id="'.($this->get_field_id( 'align' )).'" class="widefat" name="'.($this->get_field_name( 'align' )).'">
				<option '.$anone.' value="">None</option>
				<option '.$aleft.' value="left">Left</option>
				<option '.$aright.' value="right">Right</option>
				<option '.$acenter.' value="center">Center</option>
			</select>
		</p>';
	}
	
// Updating widget replacing old instances with new
	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['align'] = ( ! empty( $new_instance['align'] ) ) ? strip_tags( $new_instance['align'] ) : '';
		return $instance;
	}
} // Class wpb_widget ends here


// Register and load the widget
function buyablefunnies_load_widget() {
	register_widget( 'buyablefunnies_widget' );
}

// Create Shortcode
add_shortcode( 'buyable_funnies_widget', 'buyable_funnies_widget_shortcode' );
function buyable_funnies_widget_shortcode($atts){
	if(array_key_exists('align',$atts)){
		if($atts['align'] == 'left') $align = 'style="float:left !important"';
		if($atts['align'] == 'right') $align = 'style="float:right !important"';
		if($atts['align'] == 'center') $align = 'style="margin:0 auto !important"';
	}
	return '<div class="buyablefunnies_embed buyablefunnies_widget" '.$align.'></div>';
}