// Provides controls for the speech-to-text hook.
import { useSpeechToText } from '../hooks/useSpeechToText';
export function VoiceRecorder() { const speech = useSpeechToText(); return <section><button onClick={speech.listening ? speech.stop : speech.start}>{speech.listening ? 'Stop recording' : 'Start recording'}</button><p>{speech.text || 'No transcript yet.'}</p></section>; }