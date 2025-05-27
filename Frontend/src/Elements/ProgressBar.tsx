import '../StyleCss/ProgressBar.css';

interface ProgressLineProps {
    currentStep: number;
  }
  
  export default function ProgressLine({ currentStep }: ProgressLineProps) {
    const steps = ['Gutscheincode', 'Auswahl', 'Adresse', 'Zusammenfassung', 'Bestätigung'];
    const percent = (currentStep / steps.length) * 100;
  
    return (
      <div className="progress-container">
        {/* Schritt-Labels */}
        <div className="progress-labels">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber <= currentStep;
            const isActive = stepNumber === currentStep;
  
            return (
              <div
                key={index}
                className={`label ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              >
                {step}
              </div>
            );
          })}
        </div>
  
        {/* Balken */}
        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    );
  }