// Un champ de formulaire : son libellé, le champ lui-même (children), puis l'erreur ou l'aide.
// "id" doit être le même que l'id du champ placé dedans.
function Champ({ id, label, erreur, aide, facultatif, children }) {
  return (
    <div className={`champ ${erreur ? "invalide" : ""}`}>
      <label htmlFor={id}>
        {label}
        {facultatif && <span className="facultatif">Facultatif</span>}
      </label>
      {children}
      {/* L'erreur remplace l'aide quand il y en a une */}
      {erreur ? (
        <p className="champ-erreur" role="alert">
          {erreur}
        </p>
      ) : (
        aide && <p className="champ-aide">{aide}</p>
      )}
    </div>
  );
}

export default Champ;