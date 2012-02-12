package vPlayer;


import com.produceconsumerobot.lovid.iparade.R;

import android.app.Activity;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.widget.VideoView;
import android.widget.MediaController;


public class VideoPlayer extends Activity implements   MediaPlayer.OnErrorListener, MediaPlayer.OnCompletionListener {
	 private VideoView mVideoView;
	 private String Chemin;
	 private int videoPosition;
	 
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		

		requestWindowFeature(Window.FEATURE_NO_TITLE);
		getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
		getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		
		setContentView(R.layout.lv);
		mVideoView = (VideoView)findViewById(R.id.videoView);
	    mVideoView.setOnErrorListener(this);
	    mVideoView.setOnCompletionListener(this);

        Bundle returnData = (Bundle) getLastNonConfigurationInstance();
	    if (returnData == null) {
	    	Bundle Params = getIntent().getExtras ();
	    	String pth = Params.getString("Nme");
	    	if(pth!=null)
	    		Chemin = "android.resource://"+getPackageName() +"/raw/" + pth;
	    	else
	    		finish();
	    	 
	    	 MediaController mediaController = new MediaController(this);
	    	 mediaController.setAnchorView(mVideoView);
		     mVideoView.setVideoURI(Uri.parse(Chemin));
		     mVideoView.setMediaController(mediaController);
		     mVideoView.requestFocus();
		     //mVideoView.start();
		   
	    }
	    else
	    {
	           	Chemin = returnData.getString("LOCATION");
	            videoPosition = returnData.getInt("POSITION");
	            MediaController mediaController = new MediaController(this);
	            mediaController.setAnchorView(mVideoView);          
			    mVideoView.setMediaController(mediaController);
	            mVideoView.setVideoURI(Uri.parse(Chemin));
	            mVideoView.seekTo(videoPosition);
	            
	    }
	}
	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event) {
	    if (keyCode == KeyEvent.KEYCODE_BACK ) {
	        finish();
	        return true;
	    }
	    return super.onKeyDown(keyCode, event);
	}


	@Override
	protected void onPause() {
		super.onPause();

		if (mVideoView!=null) {
				synchronized (mVideoView) {
					mVideoView.pause();					
			}
			
		}
		
	}
		@Override
		protected void onResume() {
			super.onResume();

			if (mVideoView!=null) {
					synchronized (mVideoView) {
						mVideoView.start();		
						setVisible(true);						
				}
				
			}

		
	}
		@Override
	    public Object onRetainNonConfigurationInstance() {	        
	        videoPosition = mVideoView.getCurrentPosition();
	        Bundle data = new Bundle();
	        data.putString("LOCATION", Chemin);
	        data.putInt("POSITION", videoPosition);
	        return data;
	    }
		
		@Override
		protected void onSaveInstanceState(Bundle outState) {
			super.onSaveInstanceState(outState);
			 videoPosition = mVideoView.getCurrentPosition();
		        Bundle data = new Bundle();
		        data.putString("LOCATION", Chemin);
		        data.putInt("POSITION", videoPosition);
		}
		
	    public boolean onError(MediaPlayer player, int arg1, int arg2) {	        
	        finish();
	        return false;
	    }
		public void onCompletion(MediaPlayer mp) {
		    finish();
		}
}
