package models;

import java.util.*;

import javax.persistence.*;

import play.db.jpa.GenericModel;
import play.data.validation.*;

@Entity
@Table(name="NS_LANGUAGE")
public class Language extends GenericModel {
	
	@Required
	@Id
	@Column(name="ID_")
	public Long id;
	
	@Required
	@Column(name="LANGUAGE_NAME_")
	public String languageName;

	@ManyToMany(mappedBy="languages")
	public List<Resource> resources = new ArrayList<Resource>();

    public Language(Long languageId, String languageName) {
        this.id = languageId;
        this.languageName = languageName;
    }

    public String toString() {
	    return id + " - " + languageName;
	}
}
